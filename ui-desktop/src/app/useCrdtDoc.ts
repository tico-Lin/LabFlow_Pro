import { useEffect, useRef, useCallback, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { labflow } from "./labflow_proto";

export function useCrdtDoc(docId: string, initialValue: string = "") {
  const pendingOps = useRef<labflow.v1.ICrdtOperation[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [textValue, setTextValue] = useState(initialValue);

  useEffect(() => {
    let unlisten: UnlistenFn | null = null;

    const setup = async () => {
      await invoke("init_document_stream", { docId });

      // Listen for reconciled state from Rust backend
      unlisten = await listen<{ resolvedText: string }>(
        `crdt-update-${docId}`,
        (event) => {
          setTextValue(event.payload.resolvedText);
        },
      );
    };

    setup();

    return () => {
      if (unlisten) unlisten();
      Promise.resolve(invoke("close_document", { docId })).catch(console.error);
    };
  }, [docId]);

  const flushOps = useCallback(() => {
    if (pendingOps.current.length === 0) return;

    const opsToFlush = [...pendingOps.current];
    pendingOps.current = [];

    const chunk = labflow.v1.CrdtDeltaChunk.create({
      documentId: docId,
      operations: opsToFlush,
    });

    const encodedChunk = Uint8Array.from(
      labflow.v1.CrdtDeltaChunk.encode(chunk).finish(),
    );

    Promise.resolve(
      invoke("apply_crdt_delta", {
        docId,
        encodedChunk,
      }),
    ).catch((err) => {
      console.error("Failed to sync CRDT delta:", err);
    });
  }, [docId]);

  const queueOp = useCallback(
    (op: labflow.v1.ICrdtOperation) => {
      pendingOps.current.push(op);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        flushOps();
      }, 50);
    },
    [flushOps],
  );

  const insertText = useCallback(
    (index: number, text: string) => {
      queueOp({
        opType: labflow.v1.CrdtOperation.OpType.INSERT,
        id: `local-op-${Date.now()}-${Math.random()}`,
        index,
        value: text,
      });
    },
    [queueOp],
  );

  const deleteText = useCallback(
    (index: number, _length: number = 1) => {
      queueOp({
        opType: labflow.v1.CrdtOperation.OpType.DELETE,
        id: `local-op-${Date.now()}-${Math.random()}`,
        index,
      });
    },
    [queueOp],
  );

  // A helper to quickly optimistic-update the whole text while it synchronizes
  const handleLocalChange = useCallback(
    (newText: string) => {
      // Very naive diffing just for simulation purposes
      if (newText.length > textValue.length) {
        const inserted = newText.slice(textValue.length);
        insertText(textValue.length, inserted);
      } else if (newText.length < textValue.length) {
        deleteText(newText.length, textValue.length - newText.length);
      }
      setTextValue(newText);
    },
    [textValue, insertText, deleteText],
  );

  return {
    textValue,
    handleLocalChange,
    insertText,
    deleteText,
  };
}
