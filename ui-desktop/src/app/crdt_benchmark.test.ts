import { describe, it, expect } from "vitest";
import { labflow } from "./labflow_proto.js";

describe("CRDT Proto Benchmark", () => {
  it("serializes and deserializes 10,000 operations rapidly", () => {
    const operations = [];
    for (let i = 0; i < 10000; i++) {
      operations.push({
        opType: labflow.v1.CrdtOperation.OpType.INSERT,
        id: `op-${i}`,
        parentId: `op-${i - 1}`,
        index: i,
        value: "a",
      });
    }

    const chunk = {
      documentId: "doc-1",
      operations: operations,
    };

    const startEncoding = performance.now();
    const encoded = labflow.v1.CrdtDeltaChunk.encode(chunk).finish();
    const endEncoding = performance.now();

    const startDecoding = performance.now();
    const decoded = labflow.v1.CrdtDeltaChunk.decode(encoded);
    const endDecoding = performance.now();

    const encodeTime = endEncoding - startEncoding;
    const decodeTime = endDecoding - startDecoding;
    console.log(
      `[TS] 10,000 ops - Encode: ${encodeTime.toFixed(2)}ms, Decode: ${decodeTime.toFixed(2)}ms`,
    );

    expect(decoded.documentId).toBe("doc-1");
    expect(decoded.operations.length).toBe(10000);
    expect(decoded.operations[9999].value).toBe("a");

    // Assuming threshold of 50ms for TS layer
    expect(encodeTime).toBeLessThan(50);
    expect(decodeTime).toBeLessThan(50);
  });
});
