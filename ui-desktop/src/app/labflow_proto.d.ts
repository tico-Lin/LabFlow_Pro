import * as $protobuf from "protobufjs";
import Long = require("long");

/** Namespace labflow. */
export namespace labflow {

    /** Namespace v1. */
    namespace v1 {

        /**
         * Properties of a Session.
         * @deprecated Use labflow.v1.Session.$Properties instead.
         */
        interface ISession extends labflow.v1.Session.$Properties {
        }

        /** Represents a Session. */
        class Session {

            /**
             * Constructs a new Session.
             * @param [properties] Properties to set
             */
            constructor(properties?: labflow.v1.Session.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Session sessionId. */
            sessionId: string;

            /** Session ownerKey. */
            ownerKey: string;

            /** Session peerIds. */
            peerIds: string[];

            /** Session createdAt. */
            createdAt: (number|Long);

            /**
             * Creates a new Session instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Session instance
             */
            static create(properties: labflow.v1.Session.$Shape): labflow.v1.Session & labflow.v1.Session.$Shape;
            static create(properties?: labflow.v1.Session.$Properties): labflow.v1.Session;

            /**
             * Encodes the specified Session message. Does not implicitly {@link labflow.v1.Session.verify|verify} messages.
             * @param message Session message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: labflow.v1.Session.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Session message, length delimited. Does not implicitly {@link labflow.v1.Session.verify|verify} messages.
             * @param message Session message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: labflow.v1.Session.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Session message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {labflow.v1.Session & labflow.v1.Session.$Shape} Session
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): labflow.v1.Session & labflow.v1.Session.$Shape;

            /**
             * Decodes a Session message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {labflow.v1.Session & labflow.v1.Session.$Shape} Session
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): labflow.v1.Session & labflow.v1.Session.$Shape;

            /**
             * Verifies a Session message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Session message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Session
             */
            static fromObject(object: { [k: string]: any }): labflow.v1.Session;

            /**
             * Creates a plain object from a Session message. Also converts values to other types if specified.
             * @param message Session
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: labflow.v1.Session, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Session to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for Session
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Session {

            /** Properties of a Session. */
            interface $Properties {

                /** Session sessionId */
                sessionId?: (string|null);

                /** Session ownerKey */
                ownerKey?: (string|null);

                /** Session peerIds */
                peerIds?: (string[]|null);

                /** Session createdAt */
                createdAt?: (number|Long|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Session. */
            type $Shape = labflow.v1.Session.$Properties;
        }

        /**
         * Properties of a JoinRequest.
         * @deprecated Use labflow.v1.JoinRequest.$Properties instead.
         */
        interface IJoinRequest extends labflow.v1.JoinRequest.$Properties {
        }

        /** Represents a JoinRequest. */
        class JoinRequest {

            /**
             * Constructs a new JoinRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: labflow.v1.JoinRequest.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** JoinRequest sessionId. */
            sessionId: string;

            /** JoinRequest apiKey. */
            apiKey: string;

            /**
             * Creates a new JoinRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns JoinRequest instance
             */
            static create(properties: labflow.v1.JoinRequest.$Shape): labflow.v1.JoinRequest & labflow.v1.JoinRequest.$Shape;
            static create(properties?: labflow.v1.JoinRequest.$Properties): labflow.v1.JoinRequest;

            /**
             * Encodes the specified JoinRequest message. Does not implicitly {@link labflow.v1.JoinRequest.verify|verify} messages.
             * @param message JoinRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: labflow.v1.JoinRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified JoinRequest message, length delimited. Does not implicitly {@link labflow.v1.JoinRequest.verify|verify} messages.
             * @param message JoinRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: labflow.v1.JoinRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a JoinRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {labflow.v1.JoinRequest & labflow.v1.JoinRequest.$Shape} JoinRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): labflow.v1.JoinRequest & labflow.v1.JoinRequest.$Shape;

            /**
             * Decodes a JoinRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {labflow.v1.JoinRequest & labflow.v1.JoinRequest.$Shape} JoinRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): labflow.v1.JoinRequest & labflow.v1.JoinRequest.$Shape;

            /**
             * Verifies a JoinRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a JoinRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns JoinRequest
             */
            static fromObject(object: { [k: string]: any }): labflow.v1.JoinRequest;

            /**
             * Creates a plain object from a JoinRequest message. Also converts values to other types if specified.
             * @param message JoinRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: labflow.v1.JoinRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this JoinRequest to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for JoinRequest
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace JoinRequest {

            /** Properties of a JoinRequest. */
            interface $Properties {

                /** JoinRequest sessionId */
                sessionId?: (string|null);

                /** JoinRequest apiKey */
                apiKey?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a JoinRequest. */
            type $Shape = labflow.v1.JoinRequest.$Properties;
        }

        /**
         * Properties of a JoinResponse.
         * @deprecated Use labflow.v1.JoinResponse.$Properties instead.
         */
        interface IJoinResponse extends labflow.v1.JoinResponse.$Properties {
        }

        /** Represents a JoinResponse. */
        class JoinResponse {

            /**
             * Constructs a new JoinResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: labflow.v1.JoinResponse.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** JoinResponse accepted. */
            accepted: boolean;

            /** JoinResponse token. */
            token: string;

            /** JoinResponse message. */
            message: string;

            /**
             * Creates a new JoinResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns JoinResponse instance
             */
            static create(properties: labflow.v1.JoinResponse.$Shape): labflow.v1.JoinResponse & labflow.v1.JoinResponse.$Shape;
            static create(properties?: labflow.v1.JoinResponse.$Properties): labflow.v1.JoinResponse;

            /**
             * Encodes the specified JoinResponse message. Does not implicitly {@link labflow.v1.JoinResponse.verify|verify} messages.
             * @param message JoinResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: labflow.v1.JoinResponse.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified JoinResponse message, length delimited. Does not implicitly {@link labflow.v1.JoinResponse.verify|verify} messages.
             * @param message JoinResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: labflow.v1.JoinResponse.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a JoinResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {labflow.v1.JoinResponse & labflow.v1.JoinResponse.$Shape} JoinResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): labflow.v1.JoinResponse & labflow.v1.JoinResponse.$Shape;

            /**
             * Decodes a JoinResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {labflow.v1.JoinResponse & labflow.v1.JoinResponse.$Shape} JoinResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): labflow.v1.JoinResponse & labflow.v1.JoinResponse.$Shape;

            /**
             * Verifies a JoinResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a JoinResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns JoinResponse
             */
            static fromObject(object: { [k: string]: any }): labflow.v1.JoinResponse;

            /**
             * Creates a plain object from a JoinResponse message. Also converts values to other types if specified.
             * @param message JoinResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: labflow.v1.JoinResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this JoinResponse to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for JoinResponse
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace JoinResponse {

            /** Properties of a JoinResponse. */
            interface $Properties {

                /** JoinResponse accepted */
                accepted?: (boolean|null);

                /** JoinResponse token */
                token?: (string|null);

                /** JoinResponse message */
                message?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a JoinResponse. */
            type $Shape = labflow.v1.JoinResponse.$Properties;
        }

        /**
         * Properties of a TaskRequest.
         * @deprecated Use labflow.v1.TaskRequest.$Properties instead.
         */
        interface ITaskRequest extends labflow.v1.TaskRequest.$Properties {
        }

        /** Represents a TaskRequest. */
        class TaskRequest {

            /**
             * Constructs a new TaskRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: labflow.v1.TaskRequest.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** TaskRequest taskId. */
            taskId: string;

            /** TaskRequest sessionId. */
            sessionId: string;

            /** TaskRequest payload. */
            payload: string;

            /** TaskRequest priority. */
            priority: number;

            /**
             * Creates a new TaskRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns TaskRequest instance
             */
            static create(properties: labflow.v1.TaskRequest.$Shape): labflow.v1.TaskRequest & labflow.v1.TaskRequest.$Shape;
            static create(properties?: labflow.v1.TaskRequest.$Properties): labflow.v1.TaskRequest;

            /**
             * Encodes the specified TaskRequest message. Does not implicitly {@link labflow.v1.TaskRequest.verify|verify} messages.
             * @param message TaskRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: labflow.v1.TaskRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified TaskRequest message, length delimited. Does not implicitly {@link labflow.v1.TaskRequest.verify|verify} messages.
             * @param message TaskRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: labflow.v1.TaskRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a TaskRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {labflow.v1.TaskRequest & labflow.v1.TaskRequest.$Shape} TaskRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): labflow.v1.TaskRequest & labflow.v1.TaskRequest.$Shape;

            /**
             * Decodes a TaskRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {labflow.v1.TaskRequest & labflow.v1.TaskRequest.$Shape} TaskRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): labflow.v1.TaskRequest & labflow.v1.TaskRequest.$Shape;

            /**
             * Verifies a TaskRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a TaskRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns TaskRequest
             */
            static fromObject(object: { [k: string]: any }): labflow.v1.TaskRequest;

            /**
             * Creates a plain object from a TaskRequest message. Also converts values to other types if specified.
             * @param message TaskRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: labflow.v1.TaskRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this TaskRequest to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for TaskRequest
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace TaskRequest {

            /** Properties of a TaskRequest. */
            interface $Properties {

                /** TaskRequest taskId */
                taskId?: (string|null);

                /** TaskRequest sessionId */
                sessionId?: (string|null);

                /** TaskRequest payload */
                payload?: (string|null);

                /** TaskRequest priority */
                priority?: (number|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a TaskRequest. */
            type $Shape = labflow.v1.TaskRequest.$Properties;
        }

        /**
         * Properties of a TaskResponse.
         * @deprecated Use labflow.v1.TaskResponse.$Properties instead.
         */
        interface ITaskResponse extends labflow.v1.TaskResponse.$Properties {
        }

        /** Represents a TaskResponse. */
        class TaskResponse {

            /**
             * Constructs a new TaskResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: labflow.v1.TaskResponse.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** TaskResponse taskId. */
            taskId: string;

            /** TaskResponse result. */
            result: string;

            /** TaskResponse status. */
            status: labflow.v1.TaskStatus;

            /** TaskResponse error. */
            error: string;

            /**
             * Creates a new TaskResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns TaskResponse instance
             */
            static create(properties: labflow.v1.TaskResponse.$Shape): labflow.v1.TaskResponse & labflow.v1.TaskResponse.$Shape;
            static create(properties?: labflow.v1.TaskResponse.$Properties): labflow.v1.TaskResponse;

            /**
             * Encodes the specified TaskResponse message. Does not implicitly {@link labflow.v1.TaskResponse.verify|verify} messages.
             * @param message TaskResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: labflow.v1.TaskResponse.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified TaskResponse message, length delimited. Does not implicitly {@link labflow.v1.TaskResponse.verify|verify} messages.
             * @param message TaskResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: labflow.v1.TaskResponse.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a TaskResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {labflow.v1.TaskResponse & labflow.v1.TaskResponse.$Shape} TaskResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): labflow.v1.TaskResponse & labflow.v1.TaskResponse.$Shape;

            /**
             * Decodes a TaskResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {labflow.v1.TaskResponse & labflow.v1.TaskResponse.$Shape} TaskResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): labflow.v1.TaskResponse & labflow.v1.TaskResponse.$Shape;

            /**
             * Verifies a TaskResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a TaskResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns TaskResponse
             */
            static fromObject(object: { [k: string]: any }): labflow.v1.TaskResponse;

            /**
             * Creates a plain object from a TaskResponse message. Also converts values to other types if specified.
             * @param message TaskResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: labflow.v1.TaskResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this TaskResponse to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for TaskResponse
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace TaskResponse {

            /** Properties of a TaskResponse. */
            interface $Properties {

                /** TaskResponse taskId */
                taskId?: (string|null);

                /** TaskResponse result */
                result?: (string|null);

                /** TaskResponse status */
                status?: (labflow.v1.TaskStatus|null);

                /** TaskResponse error */
                error?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a TaskResponse. */
            type $Shape = labflow.v1.TaskResponse.$Properties;
        }

        /**
         * Properties of an ExecuteCodeRequest.
         * @deprecated Use labflow.v1.ExecuteCodeRequest.$Properties instead.
         */
        interface IExecuteCodeRequest extends labflow.v1.ExecuteCodeRequest.$Properties {
        }

        /** Represents an ExecuteCodeRequest. */
        class ExecuteCodeRequest {

            /**
             * Constructs a new ExecuteCodeRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: labflow.v1.ExecuteCodeRequest.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** ExecuteCodeRequest sessionId. */
            sessionId: string;

            /** ExecuteCodeRequest code. */
            code: string;

            /** ExecuteCodeRequest language. */
            language: string;

            /** ExecuteCodeRequest maxMemory. */
            maxMemory: (number|Long);

            /** ExecuteCodeRequest maxCpu. */
            maxCpu: (number|Long);

            /**
             * Creates a new ExecuteCodeRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ExecuteCodeRequest instance
             */
            static create(properties: labflow.v1.ExecuteCodeRequest.$Shape): labflow.v1.ExecuteCodeRequest & labflow.v1.ExecuteCodeRequest.$Shape;
            static create(properties?: labflow.v1.ExecuteCodeRequest.$Properties): labflow.v1.ExecuteCodeRequest;

            /**
             * Encodes the specified ExecuteCodeRequest message. Does not implicitly {@link labflow.v1.ExecuteCodeRequest.verify|verify} messages.
             * @param message ExecuteCodeRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: labflow.v1.ExecuteCodeRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ExecuteCodeRequest message, length delimited. Does not implicitly {@link labflow.v1.ExecuteCodeRequest.verify|verify} messages.
             * @param message ExecuteCodeRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: labflow.v1.ExecuteCodeRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an ExecuteCodeRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {labflow.v1.ExecuteCodeRequest & labflow.v1.ExecuteCodeRequest.$Shape} ExecuteCodeRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): labflow.v1.ExecuteCodeRequest & labflow.v1.ExecuteCodeRequest.$Shape;

            /**
             * Decodes an ExecuteCodeRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {labflow.v1.ExecuteCodeRequest & labflow.v1.ExecuteCodeRequest.$Shape} ExecuteCodeRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): labflow.v1.ExecuteCodeRequest & labflow.v1.ExecuteCodeRequest.$Shape;

            /**
             * Verifies an ExecuteCodeRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an ExecuteCodeRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ExecuteCodeRequest
             */
            static fromObject(object: { [k: string]: any }): labflow.v1.ExecuteCodeRequest;

            /**
             * Creates a plain object from an ExecuteCodeRequest message. Also converts values to other types if specified.
             * @param message ExecuteCodeRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: labflow.v1.ExecuteCodeRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ExecuteCodeRequest to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for ExecuteCodeRequest
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace ExecuteCodeRequest {

            /** Properties of an ExecuteCodeRequest. */
            interface $Properties {

                /** ExecuteCodeRequest sessionId */
                sessionId?: (string|null);

                /** ExecuteCodeRequest code */
                code?: (string|null);

                /** ExecuteCodeRequest language */
                language?: (string|null);

                /** ExecuteCodeRequest maxMemory */
                maxMemory?: (number|Long|null);

                /** ExecuteCodeRequest maxCpu */
                maxCpu?: (number|Long|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an ExecuteCodeRequest. */
            type $Shape = labflow.v1.ExecuteCodeRequest.$Properties;
        }

        /**
         * Properties of an ExecuteCodeResponse.
         * @deprecated Use labflow.v1.ExecuteCodeResponse.$Properties instead.
         */
        interface IExecuteCodeResponse extends labflow.v1.ExecuteCodeResponse.$Properties {
        }

        /** Represents an ExecuteCodeResponse. */
        class ExecuteCodeResponse {

            /**
             * Constructs a new ExecuteCodeResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: labflow.v1.ExecuteCodeResponse.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** ExecuteCodeResponse success. */
            success: boolean;

            /** ExecuteCodeResponse output. */
            output: string;

            /** ExecuteCodeResponse error. */
            error: string;

            /** ExecuteCodeResponse memoryUsedBytes. */
            memoryUsedBytes: (number|Long);

            /**
             * Creates a new ExecuteCodeResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ExecuteCodeResponse instance
             */
            static create(properties: labflow.v1.ExecuteCodeResponse.$Shape): labflow.v1.ExecuteCodeResponse & labflow.v1.ExecuteCodeResponse.$Shape;
            static create(properties?: labflow.v1.ExecuteCodeResponse.$Properties): labflow.v1.ExecuteCodeResponse;

            /**
             * Encodes the specified ExecuteCodeResponse message. Does not implicitly {@link labflow.v1.ExecuteCodeResponse.verify|verify} messages.
             * @param message ExecuteCodeResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: labflow.v1.ExecuteCodeResponse.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ExecuteCodeResponse message, length delimited. Does not implicitly {@link labflow.v1.ExecuteCodeResponse.verify|verify} messages.
             * @param message ExecuteCodeResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: labflow.v1.ExecuteCodeResponse.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an ExecuteCodeResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {labflow.v1.ExecuteCodeResponse & labflow.v1.ExecuteCodeResponse.$Shape} ExecuteCodeResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): labflow.v1.ExecuteCodeResponse & labflow.v1.ExecuteCodeResponse.$Shape;

            /**
             * Decodes an ExecuteCodeResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {labflow.v1.ExecuteCodeResponse & labflow.v1.ExecuteCodeResponse.$Shape} ExecuteCodeResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): labflow.v1.ExecuteCodeResponse & labflow.v1.ExecuteCodeResponse.$Shape;

            /**
             * Verifies an ExecuteCodeResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an ExecuteCodeResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ExecuteCodeResponse
             */
            static fromObject(object: { [k: string]: any }): labflow.v1.ExecuteCodeResponse;

            /**
             * Creates a plain object from an ExecuteCodeResponse message. Also converts values to other types if specified.
             * @param message ExecuteCodeResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: labflow.v1.ExecuteCodeResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ExecuteCodeResponse to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for ExecuteCodeResponse
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace ExecuteCodeResponse {

            /** Properties of an ExecuteCodeResponse. */
            interface $Properties {

                /** ExecuteCodeResponse success */
                success?: (boolean|null);

                /** ExecuteCodeResponse output */
                output?: (string|null);

                /** ExecuteCodeResponse error */
                error?: (string|null);

                /** ExecuteCodeResponse memoryUsedBytes */
                memoryUsedBytes?: (number|Long|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an ExecuteCodeResponse. */
            type $Shape = labflow.v1.ExecuteCodeResponse.$Properties;
        }

        /** TaskStatus enum. */
        enum TaskStatus {

            /** TASK_STATUS_UNSPECIFIED value */
            TASK_STATUS_UNSPECIFIED = 0,

            /** TASK_STATUS_PENDING value */
            TASK_STATUS_PENDING = 1,

            /** TASK_STATUS_RUNNING value */
            TASK_STATUS_RUNNING = 2,

            /** TASK_STATUS_DONE value */
            TASK_STATUS_DONE = 3,

            /** TASK_STATUS_FAILED value */
            TASK_STATUS_FAILED = 4
        }

        /**
         * Properties of a SandboxWriteRequest.
         * @deprecated Use labflow.v1.SandboxWriteRequest.$Properties instead.
         */
        interface ISandboxWriteRequest extends labflow.v1.SandboxWriteRequest.$Properties {
        }

        /** Represents a SandboxWriteRequest. */
        class SandboxWriteRequest {

            /**
             * Constructs a new SandboxWriteRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: labflow.v1.SandboxWriteRequest.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** SandboxWriteRequest sessionId. */
            sessionId: string;

            /** SandboxWriteRequest offset. */
            offset: (number|Long);

            /** SandboxWriteRequest data. */
            data: Uint8Array;

            /**
             * Creates a new SandboxWriteRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SandboxWriteRequest instance
             */
            static create(properties: labflow.v1.SandboxWriteRequest.$Shape): labflow.v1.SandboxWriteRequest & labflow.v1.SandboxWriteRequest.$Shape;
            static create(properties?: labflow.v1.SandboxWriteRequest.$Properties): labflow.v1.SandboxWriteRequest;

            /**
             * Encodes the specified SandboxWriteRequest message. Does not implicitly {@link labflow.v1.SandboxWriteRequest.verify|verify} messages.
             * @param message SandboxWriteRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: labflow.v1.SandboxWriteRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SandboxWriteRequest message, length delimited. Does not implicitly {@link labflow.v1.SandboxWriteRequest.verify|verify} messages.
             * @param message SandboxWriteRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: labflow.v1.SandboxWriteRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SandboxWriteRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {labflow.v1.SandboxWriteRequest & labflow.v1.SandboxWriteRequest.$Shape} SandboxWriteRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): labflow.v1.SandboxWriteRequest & labflow.v1.SandboxWriteRequest.$Shape;

            /**
             * Decodes a SandboxWriteRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {labflow.v1.SandboxWriteRequest & labflow.v1.SandboxWriteRequest.$Shape} SandboxWriteRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): labflow.v1.SandboxWriteRequest & labflow.v1.SandboxWriteRequest.$Shape;

            /**
             * Verifies a SandboxWriteRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a SandboxWriteRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns SandboxWriteRequest
             */
            static fromObject(object: { [k: string]: any }): labflow.v1.SandboxWriteRequest;

            /**
             * Creates a plain object from a SandboxWriteRequest message. Also converts values to other types if specified.
             * @param message SandboxWriteRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: labflow.v1.SandboxWriteRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this SandboxWriteRequest to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for SandboxWriteRequest
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace SandboxWriteRequest {

            /** Properties of a SandboxWriteRequest. */
            interface $Properties {

                /** SandboxWriteRequest sessionId */
                sessionId?: (string|null);

                /** SandboxWriteRequest offset */
                offset?: (number|Long|null);

                /** SandboxWriteRequest data */
                data?: (Uint8Array|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a SandboxWriteRequest. */
            type $Shape = labflow.v1.SandboxWriteRequest.$Properties;
        }

        /**
         * Properties of a SandboxReadRequest.
         * @deprecated Use labflow.v1.SandboxReadRequest.$Properties instead.
         */
        interface ISandboxReadRequest extends labflow.v1.SandboxReadRequest.$Properties {
        }

        /** Represents a SandboxReadRequest. */
        class SandboxReadRequest {

            /**
             * Constructs a new SandboxReadRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: labflow.v1.SandboxReadRequest.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** SandboxReadRequest sessionId. */
            sessionId: string;

            /** SandboxReadRequest offset. */
            offset: (number|Long);

            /** SandboxReadRequest size. */
            size: number;

            /**
             * Creates a new SandboxReadRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SandboxReadRequest instance
             */
            static create(properties: labflow.v1.SandboxReadRequest.$Shape): labflow.v1.SandboxReadRequest & labflow.v1.SandboxReadRequest.$Shape;
            static create(properties?: labflow.v1.SandboxReadRequest.$Properties): labflow.v1.SandboxReadRequest;

            /**
             * Encodes the specified SandboxReadRequest message. Does not implicitly {@link labflow.v1.SandboxReadRequest.verify|verify} messages.
             * @param message SandboxReadRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: labflow.v1.SandboxReadRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SandboxReadRequest message, length delimited. Does not implicitly {@link labflow.v1.SandboxReadRequest.verify|verify} messages.
             * @param message SandboxReadRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: labflow.v1.SandboxReadRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SandboxReadRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {labflow.v1.SandboxReadRequest & labflow.v1.SandboxReadRequest.$Shape} SandboxReadRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): labflow.v1.SandboxReadRequest & labflow.v1.SandboxReadRequest.$Shape;

            /**
             * Decodes a SandboxReadRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {labflow.v1.SandboxReadRequest & labflow.v1.SandboxReadRequest.$Shape} SandboxReadRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): labflow.v1.SandboxReadRequest & labflow.v1.SandboxReadRequest.$Shape;

            /**
             * Verifies a SandboxReadRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a SandboxReadRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns SandboxReadRequest
             */
            static fromObject(object: { [k: string]: any }): labflow.v1.SandboxReadRequest;

            /**
             * Creates a plain object from a SandboxReadRequest message. Also converts values to other types if specified.
             * @param message SandboxReadRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: labflow.v1.SandboxReadRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this SandboxReadRequest to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for SandboxReadRequest
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace SandboxReadRequest {

            /** Properties of a SandboxReadRequest. */
            interface $Properties {

                /** SandboxReadRequest sessionId */
                sessionId?: (string|null);

                /** SandboxReadRequest offset */
                offset?: (number|Long|null);

                /** SandboxReadRequest size */
                size?: (number|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a SandboxReadRequest. */
            type $Shape = labflow.v1.SandboxReadRequest.$Properties;
        }

        /**
         * Properties of a SandboxReadResponse.
         * @deprecated Use labflow.v1.SandboxReadResponse.$Properties instead.
         */
        interface ISandboxReadResponse extends labflow.v1.SandboxReadResponse.$Properties {
        }

        /** Represents a SandboxReadResponse. */
        class SandboxReadResponse {

            /**
             * Constructs a new SandboxReadResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: labflow.v1.SandboxReadResponse.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** SandboxReadResponse data. */
            data: Uint8Array;

            /** SandboxReadResponse ok. */
            ok: boolean;

            /** SandboxReadResponse error. */
            error: string;

            /**
             * Creates a new SandboxReadResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SandboxReadResponse instance
             */
            static create(properties: labflow.v1.SandboxReadResponse.$Shape): labflow.v1.SandboxReadResponse & labflow.v1.SandboxReadResponse.$Shape;
            static create(properties?: labflow.v1.SandboxReadResponse.$Properties): labflow.v1.SandboxReadResponse;

            /**
             * Encodes the specified SandboxReadResponse message. Does not implicitly {@link labflow.v1.SandboxReadResponse.verify|verify} messages.
             * @param message SandboxReadResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: labflow.v1.SandboxReadResponse.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SandboxReadResponse message, length delimited. Does not implicitly {@link labflow.v1.SandboxReadResponse.verify|verify} messages.
             * @param message SandboxReadResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: labflow.v1.SandboxReadResponse.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SandboxReadResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {labflow.v1.SandboxReadResponse & labflow.v1.SandboxReadResponse.$Shape} SandboxReadResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): labflow.v1.SandboxReadResponse & labflow.v1.SandboxReadResponse.$Shape;

            /**
             * Decodes a SandboxReadResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {labflow.v1.SandboxReadResponse & labflow.v1.SandboxReadResponse.$Shape} SandboxReadResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): labflow.v1.SandboxReadResponse & labflow.v1.SandboxReadResponse.$Shape;

            /**
             * Verifies a SandboxReadResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a SandboxReadResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns SandboxReadResponse
             */
            static fromObject(object: { [k: string]: any }): labflow.v1.SandboxReadResponse;

            /**
             * Creates a plain object from a SandboxReadResponse message. Also converts values to other types if specified.
             * @param message SandboxReadResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: labflow.v1.SandboxReadResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this SandboxReadResponse to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for SandboxReadResponse
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace SandboxReadResponse {

            /** Properties of a SandboxReadResponse. */
            interface $Properties {

                /** SandboxReadResponse data */
                data?: (Uint8Array|null);

                /** SandboxReadResponse ok */
                ok?: (boolean|null);

                /** SandboxReadResponse error */
                error?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a SandboxReadResponse. */
            type $Shape = labflow.v1.SandboxReadResponse.$Properties;
        }

        /** Represents a HostService */
        class HostService extends $protobuf.rpc.Service {

            /**
             * Constructs a new HostService service.
             * @param rpcImpl RPC implementation
             * @param [requestDelimited=false] Whether requests are length-delimited
             * @param [responseDelimited=false] Whether responses are length-delimited
             */
            constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

            /**
             * Creates new HostService service using the specified rpc implementation.
             * @param rpcImpl RPC implementation
             * @param [requestDelimited=false] Whether requests are length-delimited
             * @param [responseDelimited=false] Whether responses are length-delimited
             * @returns RPC service. Useful where requests and/or responses are streamed.
             */
            static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): HostService;

            /** Calls JoinSession. */
            joinSession: labflow.v1.HostService.JoinSession;

            /** Calls SubmitTask. */
            submitTask: labflow.v1.HostService.SubmitTask;

            /** Calls SandboxWrite. */
            sandboxWrite: labflow.v1.HostService.SandboxWrite;

            /** Calls SandboxRead. */
            sandboxRead: labflow.v1.HostService.SandboxRead;
        }

        namespace HostService {

            /**
             * Callback as used by {@link labflow.v1.HostService#joinSession}.
             * @param error Error, if any
             * @param [response] JoinResponse
             */
            type JoinSessionCallback = (error: (Error|null), response?: labflow.v1.JoinResponse) => void;

            /** Calls JoinSession. */
            type JoinSession = {
              (request: labflow.v1.IJoinRequest, callback: labflow.v1.HostService.JoinSessionCallback): void;
              (request: labflow.v1.IJoinRequest): Promise<labflow.v1.JoinResponse>;
              readonly name: "JoinSession";
              readonly path: "/labflow.v1.HostService/JoinSession";
              readonly requestType: "JoinRequest";
              readonly responseType: "JoinResponse";
              readonly requestStream: undefined;
              readonly responseStream: undefined;
            };

            /**
             * Callback as used by {@link labflow.v1.HostService#submitTask}.
             * @param error Error, if any
             * @param [response] TaskResponse
             */
            type SubmitTaskCallback = (error: (Error|null), response?: labflow.v1.TaskResponse) => void;

            /** Calls SubmitTask. */
            type SubmitTask = {
              (request: labflow.v1.ITaskRequest, callback: labflow.v1.HostService.SubmitTaskCallback): void;
              (request: labflow.v1.ITaskRequest): Promise<labflow.v1.TaskResponse>;
              readonly name: "SubmitTask";
              readonly path: "/labflow.v1.HostService/SubmitTask";
              readonly requestType: "TaskRequest";
              readonly responseType: "TaskResponse";
              readonly requestStream: undefined;
              readonly responseStream: undefined;
            };

            /**
             * Callback as used by {@link labflow.v1.HostService#sandboxWrite}.
             * @param error Error, if any
             * @param [response] SandboxReadResponse
             */
            type SandboxWriteCallback = (error: (Error|null), response?: labflow.v1.SandboxReadResponse) => void;

            /** Calls SandboxWrite. */
            type SandboxWrite = {
              (request: labflow.v1.ISandboxWriteRequest, callback: labflow.v1.HostService.SandboxWriteCallback): void;
              (request: labflow.v1.ISandboxWriteRequest): Promise<labflow.v1.SandboxReadResponse>;
              readonly name: "SandboxWrite";
              readonly path: "/labflow.v1.HostService/SandboxWrite";
              readonly requestType: "SandboxWriteRequest";
              readonly responseType: "SandboxReadResponse";
              readonly requestStream: undefined;
              readonly responseStream: undefined;
            };

            /**
             * Callback as used by {@link labflow.v1.HostService#sandboxRead}.
             * @param error Error, if any
             * @param [response] SandboxReadResponse
             */
            type SandboxReadCallback = (error: (Error|null), response?: labflow.v1.SandboxReadResponse) => void;

            /** Calls SandboxRead. */
            type SandboxRead = {
              (request: labflow.v1.ISandboxReadRequest, callback: labflow.v1.HostService.SandboxReadCallback): void;
              (request: labflow.v1.ISandboxReadRequest): Promise<labflow.v1.SandboxReadResponse>;
              readonly name: "SandboxRead";
              readonly path: "/labflow.v1.HostService/SandboxRead";
              readonly requestType: "SandboxReadRequest";
              readonly responseType: "SandboxReadResponse";
              readonly requestStream: undefined;
              readonly responseStream: undefined;
            };
        }

        /** Represents an AgentService */
        class AgentService extends $protobuf.rpc.Service {

            /**
             * Constructs a new AgentService service.
             * @param rpcImpl RPC implementation
             * @param [requestDelimited=false] Whether requests are length-delimited
             * @param [responseDelimited=false] Whether responses are length-delimited
             */
            constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

            /**
             * Creates new AgentService service using the specified rpc implementation.
             * @param rpcImpl RPC implementation
             * @param [requestDelimited=false] Whether requests are length-delimited
             * @param [responseDelimited=false] Whether responses are length-delimited
             * @returns RPC service. Useful where requests and/or responses are streamed.
             */
            static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): AgentService;

            /** Calls ExecuteTask. */
            executeTask: labflow.v1.AgentService.ExecuteTask;

            /** Calls ExecuteCode. */
            executeCode: labflow.v1.AgentService.ExecuteCode;

            /** Calls AgentEventStream. */
            agentEventStream: labflow.v1.AgentService.AgentEventStream;
        }

        namespace AgentService {

            /**
             * Callback as used by {@link labflow.v1.AgentService#executeTask}.
             * @param error Error, if any
             * @param [response] TaskResponse
             */
            type ExecuteTaskCallback = (error: (Error|null), response?: labflow.v1.TaskResponse) => void;

            /** Calls ExecuteTask. */
            type ExecuteTask = {
              (request: labflow.v1.ITaskRequest, callback: labflow.v1.AgentService.ExecuteTaskCallback): void;
              (request: labflow.v1.ITaskRequest): Promise<labflow.v1.TaskResponse>;
              readonly name: "ExecuteTask";
              readonly path: "/labflow.v1.AgentService/ExecuteTask";
              readonly requestType: "TaskRequest";
              readonly responseType: "TaskResponse";
              readonly requestStream: undefined;
              readonly responseStream: true;
            };

            /**
             * Callback as used by {@link labflow.v1.AgentService#executeCode}.
             * @param error Error, if any
             * @param [response] ExecuteCodeResponse
             */
            type ExecuteCodeCallback = (error: (Error|null), response?: labflow.v1.ExecuteCodeResponse) => void;

            /** Calls ExecuteCode. */
            type ExecuteCode = {
              (request: labflow.v1.IExecuteCodeRequest, callback: labflow.v1.AgentService.ExecuteCodeCallback): void;
              (request: labflow.v1.IExecuteCodeRequest): Promise<labflow.v1.ExecuteCodeResponse>;
              readonly name: "ExecuteCode";
              readonly path: "/labflow.v1.AgentService/ExecuteCode";
              readonly requestType: "ExecuteCodeRequest";
              readonly responseType: "ExecuteCodeResponse";
              readonly requestStream: undefined;
              readonly responseStream: undefined;
            };

            /**
             * Callback as used by {@link labflow.v1.AgentService#agentEventStream}.
             * @param error Error, if any
             * @param [response] AgentEventResponse
             */
            type AgentEventStreamCallback = (error: (Error|null), response?: labflow.v1.AgentEventResponse) => void;

            /** Calls AgentEventStream. */
            type AgentEventStream = {
              (request: labflow.v1.IAgentEventRequest, callback: labflow.v1.AgentService.AgentEventStreamCallback): void;
              (request: labflow.v1.IAgentEventRequest): Promise<labflow.v1.AgentEventResponse>;
              readonly name: "AgentEventStream";
              readonly path: "/labflow.v1.AgentService/AgentEventStream";
              readonly requestType: "AgentEventRequest";
              readonly responseType: "AgentEventResponse";
              readonly requestStream: true;
              readonly responseStream: true;
            };
        }

        /**
         * Properties of a ChartState.
         * @deprecated Use labflow.v1.ChartState.$Properties instead.
         */
        interface IChartState extends labflow.v1.ChartState.$Properties {
        }

        /** Represents a ChartState. */
        class ChartState {

            /**
             * Constructs a new ChartState.
             * @param [properties] Properties to set
             */
            constructor(properties?: labflow.v1.ChartState.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** ChartState chartId. */
            chartId: string;

            /** ChartState type. */
            type: string;

            /** ChartState data. */
            data: Uint8Array;

            /**
             * Creates a new ChartState instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ChartState instance
             */
            static create(properties: labflow.v1.ChartState.$Shape): labflow.v1.ChartState & labflow.v1.ChartState.$Shape;
            static create(properties?: labflow.v1.ChartState.$Properties): labflow.v1.ChartState;

            /**
             * Encodes the specified ChartState message. Does not implicitly {@link labflow.v1.ChartState.verify|verify} messages.
             * @param message ChartState message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: labflow.v1.ChartState.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ChartState message, length delimited. Does not implicitly {@link labflow.v1.ChartState.verify|verify} messages.
             * @param message ChartState message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: labflow.v1.ChartState.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ChartState message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {labflow.v1.ChartState & labflow.v1.ChartState.$Shape} ChartState
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): labflow.v1.ChartState & labflow.v1.ChartState.$Shape;

            /**
             * Decodes a ChartState message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {labflow.v1.ChartState & labflow.v1.ChartState.$Shape} ChartState
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): labflow.v1.ChartState & labflow.v1.ChartState.$Shape;

            /**
             * Verifies a ChartState message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ChartState message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ChartState
             */
            static fromObject(object: { [k: string]: any }): labflow.v1.ChartState;

            /**
             * Creates a plain object from a ChartState message. Also converts values to other types if specified.
             * @param message ChartState
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: labflow.v1.ChartState, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ChartState to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for ChartState
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace ChartState {

            /** Properties of a ChartState. */
            interface $Properties {

                /** ChartState chartId */
                chartId?: (string|null);

                /** ChartState type */
                type?: (string|null);

                /** ChartState data */
                data?: (Uint8Array|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a ChartState. */
            type $Shape = labflow.v1.ChartState.$Properties;
        }

        /**
         * Properties of a ChemicalStructure.
         * @deprecated Use labflow.v1.ChemicalStructure.$Properties instead.
         */
        interface IChemicalStructure extends labflow.v1.ChemicalStructure.$Properties {
        }

        /** Represents a ChemicalStructure. */
        class ChemicalStructure {

            /**
             * Constructs a new ChemicalStructure.
             * @param [properties] Properties to set
             */
            constructor(properties?: labflow.v1.ChemicalStructure.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** ChemicalStructure structureId. */
            structureId: string;

            /** ChemicalStructure format. */
            format: string;

            /** ChemicalStructure payload. */
            payload: string;

            /**
             * Creates a new ChemicalStructure instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ChemicalStructure instance
             */
            static create(properties: labflow.v1.ChemicalStructure.$Shape): labflow.v1.ChemicalStructure & labflow.v1.ChemicalStructure.$Shape;
            static create(properties?: labflow.v1.ChemicalStructure.$Properties): labflow.v1.ChemicalStructure;

            /**
             * Encodes the specified ChemicalStructure message. Does not implicitly {@link labflow.v1.ChemicalStructure.verify|verify} messages.
             * @param message ChemicalStructure message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: labflow.v1.ChemicalStructure.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ChemicalStructure message, length delimited. Does not implicitly {@link labflow.v1.ChemicalStructure.verify|verify} messages.
             * @param message ChemicalStructure message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: labflow.v1.ChemicalStructure.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ChemicalStructure message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {labflow.v1.ChemicalStructure & labflow.v1.ChemicalStructure.$Shape} ChemicalStructure
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): labflow.v1.ChemicalStructure & labflow.v1.ChemicalStructure.$Shape;

            /**
             * Decodes a ChemicalStructure message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {labflow.v1.ChemicalStructure & labflow.v1.ChemicalStructure.$Shape} ChemicalStructure
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): labflow.v1.ChemicalStructure & labflow.v1.ChemicalStructure.$Shape;

            /**
             * Verifies a ChemicalStructure message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ChemicalStructure message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ChemicalStructure
             */
            static fromObject(object: { [k: string]: any }): labflow.v1.ChemicalStructure;

            /**
             * Creates a plain object from a ChemicalStructure message. Also converts values to other types if specified.
             * @param message ChemicalStructure
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: labflow.v1.ChemicalStructure, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ChemicalStructure to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for ChemicalStructure
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace ChemicalStructure {

            /** Properties of a ChemicalStructure. */
            interface $Properties {

                /** ChemicalStructure structureId */
                structureId?: (string|null);

                /** ChemicalStructure format */
                format?: (string|null);

                /** ChemicalStructure payload */
                payload?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a ChemicalStructure. */
            type $Shape = labflow.v1.ChemicalStructure.$Properties;
        }

        /**
         * Properties of a MarkdownAST.
         * @deprecated Use labflow.v1.MarkdownAST.$Properties instead.
         */
        interface IMarkdownAST extends labflow.v1.MarkdownAST.$Properties {
        }

        /** Represents a MarkdownAST. */
        class MarkdownAST {

            /**
             * Constructs a new MarkdownAST.
             * @param [properties] Properties to set
             */
            constructor(properties?: labflow.v1.MarkdownAST.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** MarkdownAST documentId. */
            documentId: string;

            /** MarkdownAST rootNode. */
            rootNode: string;

            /**
             * Creates a new MarkdownAST instance using the specified properties.
             * @param [properties] Properties to set
             * @returns MarkdownAST instance
             */
            static create(properties: labflow.v1.MarkdownAST.$Shape): labflow.v1.MarkdownAST & labflow.v1.MarkdownAST.$Shape;
            static create(properties?: labflow.v1.MarkdownAST.$Properties): labflow.v1.MarkdownAST;

            /**
             * Encodes the specified MarkdownAST message. Does not implicitly {@link labflow.v1.MarkdownAST.verify|verify} messages.
             * @param message MarkdownAST message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: labflow.v1.MarkdownAST.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified MarkdownAST message, length delimited. Does not implicitly {@link labflow.v1.MarkdownAST.verify|verify} messages.
             * @param message MarkdownAST message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: labflow.v1.MarkdownAST.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a MarkdownAST message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {labflow.v1.MarkdownAST & labflow.v1.MarkdownAST.$Shape} MarkdownAST
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): labflow.v1.MarkdownAST & labflow.v1.MarkdownAST.$Shape;

            /**
             * Decodes a MarkdownAST message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {labflow.v1.MarkdownAST & labflow.v1.MarkdownAST.$Shape} MarkdownAST
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): labflow.v1.MarkdownAST & labflow.v1.MarkdownAST.$Shape;

            /**
             * Verifies a MarkdownAST message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a MarkdownAST message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns MarkdownAST
             */
            static fromObject(object: { [k: string]: any }): labflow.v1.MarkdownAST;

            /**
             * Creates a plain object from a MarkdownAST message. Also converts values to other types if specified.
             * @param message MarkdownAST
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: labflow.v1.MarkdownAST, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this MarkdownAST to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for MarkdownAST
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace MarkdownAST {

            /** Properties of a MarkdownAST. */
            interface $Properties {

                /** MarkdownAST documentId */
                documentId?: (string|null);

                /** MarkdownAST rootNode */
                rootNode?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a MarkdownAST. */
            type $Shape = labflow.v1.MarkdownAST.$Properties;
        }

        /**
         * Properties of a DeltaMutation.
         * @deprecated Use labflow.v1.DeltaMutation.$Properties instead.
         */
        interface IDeltaMutation extends labflow.v1.DeltaMutation.$Properties {
        }

        /** Represents a DeltaMutation. */
        class DeltaMutation {

            /**
             * Constructs a new DeltaMutation.
             * @param [properties] Properties to set
             */
            constructor(properties?: labflow.v1.DeltaMutation.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** DeltaMutation targetId. */
            targetId: string;

            /** DeltaMutation deltaData. */
            deltaData: Uint8Array;

            /**
             * Creates a new DeltaMutation instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeltaMutation instance
             */
            static create(properties: labflow.v1.DeltaMutation.$Shape): labflow.v1.DeltaMutation & labflow.v1.DeltaMutation.$Shape;
            static create(properties?: labflow.v1.DeltaMutation.$Properties): labflow.v1.DeltaMutation;

            /**
             * Encodes the specified DeltaMutation message. Does not implicitly {@link labflow.v1.DeltaMutation.verify|verify} messages.
             * @param message DeltaMutation message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: labflow.v1.DeltaMutation.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeltaMutation message, length delimited. Does not implicitly {@link labflow.v1.DeltaMutation.verify|verify} messages.
             * @param message DeltaMutation message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: labflow.v1.DeltaMutation.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeltaMutation message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {labflow.v1.DeltaMutation & labflow.v1.DeltaMutation.$Shape} DeltaMutation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): labflow.v1.DeltaMutation & labflow.v1.DeltaMutation.$Shape;

            /**
             * Decodes a DeltaMutation message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {labflow.v1.DeltaMutation & labflow.v1.DeltaMutation.$Shape} DeltaMutation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): labflow.v1.DeltaMutation & labflow.v1.DeltaMutation.$Shape;

            /**
             * Verifies a DeltaMutation message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DeltaMutation message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DeltaMutation
             */
            static fromObject(object: { [k: string]: any }): labflow.v1.DeltaMutation;

            /**
             * Creates a plain object from a DeltaMutation message. Also converts values to other types if specified.
             * @param message DeltaMutation
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: labflow.v1.DeltaMutation, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DeltaMutation to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for DeltaMutation
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace DeltaMutation {

            /** Properties of a DeltaMutation. */
            interface $Properties {

                /** DeltaMutation targetId */
                targetId?: (string|null);

                /** DeltaMutation deltaData */
                deltaData?: (Uint8Array|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a DeltaMutation. */
            type $Shape = labflow.v1.DeltaMutation.$Properties;
        }

        /**
         * Properties of an AgentEventRequest.
         * @deprecated Use labflow.v1.AgentEventRequest.$Properties instead.
         */
        interface IAgentEventRequest extends labflow.v1.AgentEventRequest.$Properties {
        }

        /** Represents an AgentEventRequest. */
        class AgentEventRequest {

            /**
             * Constructs a new AgentEventRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: labflow.v1.AgentEventRequest.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** AgentEventRequest sessionId. */
            sessionId: string;

            /** AgentEventRequest eventType. */
            eventType: string;

            /** AgentEventRequest payload. */
            payload: Uint8Array;

            /**
             * Creates a new AgentEventRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns AgentEventRequest instance
             */
            static create(properties: labflow.v1.AgentEventRequest.$Shape): labflow.v1.AgentEventRequest & labflow.v1.AgentEventRequest.$Shape;
            static create(properties?: labflow.v1.AgentEventRequest.$Properties): labflow.v1.AgentEventRequest;

            /**
             * Encodes the specified AgentEventRequest message. Does not implicitly {@link labflow.v1.AgentEventRequest.verify|verify} messages.
             * @param message AgentEventRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: labflow.v1.AgentEventRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified AgentEventRequest message, length delimited. Does not implicitly {@link labflow.v1.AgentEventRequest.verify|verify} messages.
             * @param message AgentEventRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: labflow.v1.AgentEventRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an AgentEventRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {labflow.v1.AgentEventRequest & labflow.v1.AgentEventRequest.$Shape} AgentEventRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): labflow.v1.AgentEventRequest & labflow.v1.AgentEventRequest.$Shape;

            /**
             * Decodes an AgentEventRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {labflow.v1.AgentEventRequest & labflow.v1.AgentEventRequest.$Shape} AgentEventRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): labflow.v1.AgentEventRequest & labflow.v1.AgentEventRequest.$Shape;

            /**
             * Verifies an AgentEventRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an AgentEventRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns AgentEventRequest
             */
            static fromObject(object: { [k: string]: any }): labflow.v1.AgentEventRequest;

            /**
             * Creates a plain object from an AgentEventRequest message. Also converts values to other types if specified.
             * @param message AgentEventRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: labflow.v1.AgentEventRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this AgentEventRequest to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for AgentEventRequest
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace AgentEventRequest {

            /** Properties of an AgentEventRequest. */
            interface $Properties {

                /** AgentEventRequest sessionId */
                sessionId?: (string|null);

                /** AgentEventRequest eventType */
                eventType?: (string|null);

                /** AgentEventRequest payload */
                payload?: (Uint8Array|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an AgentEventRequest. */
            type $Shape = labflow.v1.AgentEventRequest.$Properties;
        }

        /**
         * Properties of an AgentEventResponse.
         * @deprecated Use labflow.v1.AgentEventResponse.$Properties instead.
         */
        interface IAgentEventResponse extends labflow.v1.AgentEventResponse.$Properties {
        }

        /** Represents an AgentEventResponse. */
        class AgentEventResponse {

            /**
             * Constructs a new AgentEventResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: labflow.v1.AgentEventResponse.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** AgentEventResponse sessionId. */
            sessionId: string;

            /** AgentEventResponse responseType. */
            responseType: string;

            /** AgentEventResponse payload. */
            payload: Uint8Array;

            /**
             * Creates a new AgentEventResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns AgentEventResponse instance
             */
            static create(properties: labflow.v1.AgentEventResponse.$Shape): labflow.v1.AgentEventResponse & labflow.v1.AgentEventResponse.$Shape;
            static create(properties?: labflow.v1.AgentEventResponse.$Properties): labflow.v1.AgentEventResponse;

            /**
             * Encodes the specified AgentEventResponse message. Does not implicitly {@link labflow.v1.AgentEventResponse.verify|verify} messages.
             * @param message AgentEventResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: labflow.v1.AgentEventResponse.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified AgentEventResponse message, length delimited. Does not implicitly {@link labflow.v1.AgentEventResponse.verify|verify} messages.
             * @param message AgentEventResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: labflow.v1.AgentEventResponse.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an AgentEventResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {labflow.v1.AgentEventResponse & labflow.v1.AgentEventResponse.$Shape} AgentEventResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): labflow.v1.AgentEventResponse & labflow.v1.AgentEventResponse.$Shape;

            /**
             * Decodes an AgentEventResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {labflow.v1.AgentEventResponse & labflow.v1.AgentEventResponse.$Shape} AgentEventResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): labflow.v1.AgentEventResponse & labflow.v1.AgentEventResponse.$Shape;

            /**
             * Verifies an AgentEventResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an AgentEventResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns AgentEventResponse
             */
            static fromObject(object: { [k: string]: any }): labflow.v1.AgentEventResponse;

            /**
             * Creates a plain object from an AgentEventResponse message. Also converts values to other types if specified.
             * @param message AgentEventResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: labflow.v1.AgentEventResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this AgentEventResponse to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for AgentEventResponse
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace AgentEventResponse {

            /** Properties of an AgentEventResponse. */
            interface $Properties {

                /** AgentEventResponse sessionId */
                sessionId?: (string|null);

                /** AgentEventResponse responseType */
                responseType?: (string|null);

                /** AgentEventResponse payload */
                payload?: (Uint8Array|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an AgentEventResponse. */
            type $Shape = labflow.v1.AgentEventResponse.$Properties;
        }

        /**
         * Properties of a CrdtOperation.
         * @deprecated Use labflow.v1.CrdtOperation.$Properties instead.
         */
        interface ICrdtOperation extends labflow.v1.CrdtOperation.$Properties {
        }

        /** Represents a CrdtOperation. */
        class CrdtOperation {

            /**
             * Constructs a new CrdtOperation.
             * @param [properties] Properties to set
             */
            constructor(properties?: labflow.v1.CrdtOperation.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** CrdtOperation opType. */
            opType: labflow.v1.CrdtOperation.OpType;

            /** CrdtOperation id. */
            id: string;

            /** CrdtOperation parentId. */
            parentId: string;

            /** CrdtOperation index. */
            index: number;

            /** CrdtOperation value. */
            value: string;

            /**
             * Creates a new CrdtOperation instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CrdtOperation instance
             */
            static create(properties: labflow.v1.CrdtOperation.$Shape): labflow.v1.CrdtOperation & labflow.v1.CrdtOperation.$Shape;
            static create(properties?: labflow.v1.CrdtOperation.$Properties): labflow.v1.CrdtOperation;

            /**
             * Encodes the specified CrdtOperation message. Does not implicitly {@link labflow.v1.CrdtOperation.verify|verify} messages.
             * @param message CrdtOperation message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: labflow.v1.CrdtOperation.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CrdtOperation message, length delimited. Does not implicitly {@link labflow.v1.CrdtOperation.verify|verify} messages.
             * @param message CrdtOperation message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: labflow.v1.CrdtOperation.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CrdtOperation message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {labflow.v1.CrdtOperation & labflow.v1.CrdtOperation.$Shape} CrdtOperation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): labflow.v1.CrdtOperation & labflow.v1.CrdtOperation.$Shape;

            /**
             * Decodes a CrdtOperation message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {labflow.v1.CrdtOperation & labflow.v1.CrdtOperation.$Shape} CrdtOperation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): labflow.v1.CrdtOperation & labflow.v1.CrdtOperation.$Shape;

            /**
             * Verifies a CrdtOperation message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CrdtOperation message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CrdtOperation
             */
            static fromObject(object: { [k: string]: any }): labflow.v1.CrdtOperation;

            /**
             * Creates a plain object from a CrdtOperation message. Also converts values to other types if specified.
             * @param message CrdtOperation
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: labflow.v1.CrdtOperation, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CrdtOperation to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for CrdtOperation
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace CrdtOperation {

            /** Properties of a CrdtOperation. */
            interface $Properties {

                /** CrdtOperation opType */
                opType?: (labflow.v1.CrdtOperation.OpType|null);

                /** CrdtOperation id */
                id?: (string|null);

                /** CrdtOperation parentId */
                parentId?: (string|null);

                /** CrdtOperation index */
                index?: (number|null);

                /** CrdtOperation value */
                value?: (string|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a CrdtOperation. */
            type $Shape = labflow.v1.CrdtOperation.$Properties;

            /** OpType enum. */
            enum OpType {

                /** INSERT value */
                INSERT = 0,

                /** DELETE value */
                DELETE = 1,

                /** UPDATE value */
                UPDATE = 2
            }
        }

        /**
         * Properties of a CrdtDeltaChunk.
         * @deprecated Use labflow.v1.CrdtDeltaChunk.$Properties instead.
         */
        interface ICrdtDeltaChunk extends labflow.v1.CrdtDeltaChunk.$Properties {
        }

        /** Represents a CrdtDeltaChunk. */
        class CrdtDeltaChunk {

            /**
             * Constructs a new CrdtDeltaChunk.
             * @param [properties] Properties to set
             */
            constructor(properties?: labflow.v1.CrdtDeltaChunk.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** CrdtDeltaChunk documentId. */
            documentId: string;

            /** CrdtDeltaChunk operations. */
            operations: labflow.v1.CrdtOperation.$Properties[];

            /**
             * Creates a new CrdtDeltaChunk instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CrdtDeltaChunk instance
             */
            static create(properties: labflow.v1.CrdtDeltaChunk.$Shape): labflow.v1.CrdtDeltaChunk & labflow.v1.CrdtDeltaChunk.$Shape;
            static create(properties?: labflow.v1.CrdtDeltaChunk.$Properties): labflow.v1.CrdtDeltaChunk;

            /**
             * Encodes the specified CrdtDeltaChunk message. Does not implicitly {@link labflow.v1.CrdtDeltaChunk.verify|verify} messages.
             * @param message CrdtDeltaChunk message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: labflow.v1.CrdtDeltaChunk.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CrdtDeltaChunk message, length delimited. Does not implicitly {@link labflow.v1.CrdtDeltaChunk.verify|verify} messages.
             * @param message CrdtDeltaChunk message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encodeDelimited(message: labflow.v1.CrdtDeltaChunk.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CrdtDeltaChunk message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {labflow.v1.CrdtDeltaChunk & labflow.v1.CrdtDeltaChunk.$Shape} CrdtDeltaChunk
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): labflow.v1.CrdtDeltaChunk & labflow.v1.CrdtDeltaChunk.$Shape;

            /**
             * Decodes a CrdtDeltaChunk message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns {labflow.v1.CrdtDeltaChunk & labflow.v1.CrdtDeltaChunk.$Shape} CrdtDeltaChunk
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): labflow.v1.CrdtDeltaChunk & labflow.v1.CrdtDeltaChunk.$Shape;

            /**
             * Verifies a CrdtDeltaChunk message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CrdtDeltaChunk message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CrdtDeltaChunk
             */
            static fromObject(object: { [k: string]: any }): labflow.v1.CrdtDeltaChunk;

            /**
             * Creates a plain object from a CrdtDeltaChunk message. Also converts values to other types if specified.
             * @param message CrdtDeltaChunk
             * @param [options] Conversion options
             * @returns Plain object
             */
            static toObject(message: labflow.v1.CrdtDeltaChunk, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CrdtDeltaChunk to JSON.
             * @returns JSON object
             */
            toJSON(): { [k: string]: any };

            /**
             * Gets the type url for CrdtDeltaChunk
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace CrdtDeltaChunk {

            /** Properties of a CrdtDeltaChunk. */
            interface $Properties {

                /** CrdtDeltaChunk documentId */
                documentId?: (string|null);

                /** CrdtDeltaChunk operations */
                operations?: (labflow.v1.CrdtOperation.$Properties[]|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a CrdtDeltaChunk. */
            type $Shape = labflow.v1.CrdtDeltaChunk.$Properties;
        }
    }
}
