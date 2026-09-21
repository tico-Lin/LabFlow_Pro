/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-mixed-operators, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars, default-case, jsdoc/require-param*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
const $Object = $util.global.Object, $undefined = $util.global.undefined, $Error = $util.global.Error, $RangeError = $util.global.RangeError, $Array = $util.global.Array, $TypeError = $util.global.TypeError, $String = $util.global.String, $Number = $util.global.Number, $parseInt = $util.global.parseInt, $BigInt = $util.global.BigInt, $Boolean = $util.global.Boolean;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const labflow = $root.labflow = (() => {

    /**
     * Namespace labflow.
     * @exports labflow
     * @namespace
     */
    const labflow = {};

    labflow.v1 = (function() {

        /**
         * Namespace v1.
         * @memberof labflow
         * @namespace
         */
        const v1 = {};

        v1.Session = (function() {

            /**
             * Properties of a Session.
             * @typedef {Object} labflow.v1.Session.$Properties
             * @property {string|null} [sessionId] Session sessionId
             * @property {string|null} [ownerKey] Session ownerKey
             * @property {Array.<string>|null} [peerIds] Session peerIds
             * @property {number|Long|null} [createdAt] Session createdAt
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Session.
             * @memberof labflow.v1
             * @interface ISession
             * @augments labflow.v1.Session.$Properties
             * @deprecated Use labflow.v1.Session.$Properties instead.
             */

            /**
             * Shape of a Session.
             * @typedef {labflow.v1.Session.$Properties} labflow.v1.Session.$Shape
             */

            /**
             * Constructs a new Session.
             * @memberof labflow.v1
             * @classdesc Represents a Session.
             * @constructor
             * @param {labflow.v1.Session.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Session = function (properties) {
                this.peerIds = [];
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Session sessionId.
             * @member {string} sessionId
             * @memberof labflow.v1.Session
             * @instance
             */
            Session.prototype.sessionId = "";

            /**
             * Session ownerKey.
             * @member {string} ownerKey
             * @memberof labflow.v1.Session
             * @instance
             */
            Session.prototype.ownerKey = "";

            /**
             * Session peerIds.
             * @member {Array.<string>} peerIds
             * @memberof labflow.v1.Session
             * @instance
             */
            Session.prototype.peerIds = $util.emptyArray;

            /**
             * Session createdAt.
             * @member {number|Long} createdAt
             * @memberof labflow.v1.Session
             * @instance
             */
            Session.prototype.createdAt = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new Session instance using the specified properties.
             * @function create
             * @memberof labflow.v1.Session
             * @static
             * @param {labflow.v1.Session.$Properties=} [properties] Properties to set
             * @returns {labflow.v1.Session} Session instance
             * @type {{
             *   (properties: labflow.v1.Session.$Shape): labflow.v1.Session & labflow.v1.Session.$Shape;
             *   (properties?: labflow.v1.Session.$Properties): labflow.v1.Session;
             * }}
             */
            Session.create = function(properties) {
                return new Session(properties);
            };

            /**
             * Encodes the specified Session message. Does not implicitly {@link labflow.v1.Session.verify|verify} messages.
             * @function encode
             * @memberof labflow.v1.Session
             * @static
             * @param {labflow.v1.Session.$Properties} message Session message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Session.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId") && message.sessionId !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.sessionId);
                if (message.ownerKey != null && $Object.hasOwnProperty.call(message, "ownerKey") && message.ownerKey !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.ownerKey);
                if (message.peerIds != null && message.peerIds.length)
                    for (let i = 0; i < message.peerIds.length; ++i)
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.peerIds[i]);
                if (message.createdAt != null && $Object.hasOwnProperty.call(message, "createdAt") && (typeof message.createdAt === "object" ? message.createdAt.low || message.createdAt.high : message.createdAt !== 0))
                    writer.uint32(/* id 4, wireType 0 =*/32).int64(message.createdAt);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified Session message, length delimited. Does not implicitly {@link labflow.v1.Session.verify|verify} messages.
             * @function encodeDelimited
             * @memberof labflow.v1.Session
             * @static
             * @param {labflow.v1.Session.$Properties} message Session message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Session.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a Session message from the specified reader or buffer.
             * @function decode
             * @memberof labflow.v1.Session
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {labflow.v1.Session & labflow.v1.Session.$Shape} Session
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Session.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message, value;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.labflow.v1.Session();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.sessionId = value;
                            else
                                delete message.sessionId;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.ownerKey = value;
                            else
                                delete message.ownerKey;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if (!(message.peerIds && message.peerIds.length))
                                message.peerIds = [];
                            message.peerIds.push(reader.stringVerify());
                            continue;
                        }
                    case 4: {
                            if (wireType !== 0)
                                break;
                            if (typeof (value = reader.int64()) === "object" ? value.low || value.high : value !== 0)
                                message.createdAt = value;
                            else
                                delete message.createdAt;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a Session message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof labflow.v1.Session
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {labflow.v1.Session & labflow.v1.Session.$Shape} Session
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Session.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Session message.
             * @function verify
             * @memberof labflow.v1.Session
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Session.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
                    if (!$util.isString(message.sessionId))
                        return "sessionId: string expected";
                if (message.ownerKey != null && $Object.hasOwnProperty.call(message, "ownerKey"))
                    if (!$util.isString(message.ownerKey))
                        return "ownerKey: string expected";
                if (message.peerIds != null && $Object.hasOwnProperty.call(message, "peerIds")) {
                    if (!$Array.isArray(message.peerIds))
                        return "peerIds: array expected";
                    for (let i = 0; i < message.peerIds.length; ++i)
                        if (!$util.isString(message.peerIds[i]))
                            return "peerIds: string[] expected";
                }
                if (message.createdAt != null && $Object.hasOwnProperty.call(message, "createdAt"))
                    if (!$util.isInteger(message.createdAt) && !(message.createdAt && $util.isInteger(message.createdAt.low) && $util.isInteger(message.createdAt.high)))
                        return "createdAt: integer|Long expected";
                return null;
            };

            /**
             * Creates a Session message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof labflow.v1.Session
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {labflow.v1.Session} Session
             */
            Session.fromObject = function (object, _depth) {
                if (object instanceof $root.labflow.v1.Session)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".labflow.v1.Session: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.labflow.v1.Session();
                if (object.sessionId != null)
                    if (typeof object.sessionId !== "string" || object.sessionId.length)
                        message.sessionId = $String(object.sessionId);
                if (object.ownerKey != null)
                    if (typeof object.ownerKey !== "string" || object.ownerKey.length)
                        message.ownerKey = $String(object.ownerKey);
                if (object.peerIds) {
                    if (!$Array.isArray(object.peerIds))
                        throw $TypeError(".labflow.v1.Session.peerIds: array expected");
                    message.peerIds = $Array(object.peerIds.length);
                    for (let i = 0; i < object.peerIds.length; ++i)
                        message.peerIds[i] = $String(object.peerIds[i]);
                }
                if (object.createdAt != null)
                    if (typeof object.createdAt === "object" ? object.createdAt.low || object.createdAt.high : $Number(object.createdAt) !== 0)
                        if ($util.Long)
                            message.createdAt = $util.Long.fromValue(object.createdAt, false);
                        else if (typeof object.createdAt === "string")
                            message.createdAt = $parseInt(object.createdAt, 10);
                        else if (typeof object.createdAt === "number")
                            message.createdAt = object.createdAt;
                        else if (typeof object.createdAt === "object")
                            message.createdAt = new $util.LongBits(object.createdAt.low >>> 0, object.createdAt.high >>> 0).toNumber();
                return message;
            };

            /**
             * Creates a plain object from a Session message. Also converts values to other types if specified.
             * @function toObject
             * @memberof labflow.v1.Session
             * @static
             * @param {labflow.v1.Session} message Session
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Session.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.arrays || options.defaults)
                    object.peerIds = [];
                if (options.defaults) {
                    object.sessionId = "";
                    object.ownerKey = "";
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.createdAt = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                    } else
                        object.createdAt = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                }
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
                    object.sessionId = message.sessionId;
                if (message.ownerKey != null && $Object.hasOwnProperty.call(message, "ownerKey"))
                    object.ownerKey = message.ownerKey;
                if (message.peerIds && message.peerIds.length) {
                    object.peerIds = $Array(message.peerIds.length);
                    for (let j = 0; j < message.peerIds.length; ++j)
                        object.peerIds[j] = message.peerIds[j];
                }
                if (message.createdAt != null && $Object.hasOwnProperty.call(message, "createdAt"))
                    if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                        object.createdAt = typeof message.createdAt === "number" ? $BigInt(message.createdAt) : $util.Long.fromBits(message.createdAt.low >>> 0, message.createdAt.high >>> 0, false).toBigInt();
                    else if (typeof message.createdAt === "number")
                        object.createdAt = options.longs === $String ? $String(message.createdAt) : message.createdAt;
                    else
                        object.createdAt = options.longs === $String ? $util.Long.prototype.toString.call(message.createdAt) : options.longs === $Number ? new $util.LongBits(message.createdAt.low >>> 0, message.createdAt.high >>> 0).toNumber() : message.createdAt;
                return object;
            };

            /**
             * Converts this Session to JSON.
             * @function toJSON
             * @memberof labflow.v1.Session
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Session.prototype.toJSON = function() {
                return Session.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for Session
             * @function getTypeUrl
             * @memberof labflow.v1.Session
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Session.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/labflow.v1.Session";
            };

            return Session;
        })();

        v1.JoinRequest = (function() {

            /**
             * Properties of a JoinRequest.
             * @typedef {Object} labflow.v1.JoinRequest.$Properties
             * @property {string|null} [sessionId] JoinRequest sessionId
             * @property {string|null} [apiKey] JoinRequest apiKey
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a JoinRequest.
             * @memberof labflow.v1
             * @interface IJoinRequest
             * @augments labflow.v1.JoinRequest.$Properties
             * @deprecated Use labflow.v1.JoinRequest.$Properties instead.
             */

            /**
             * Shape of a JoinRequest.
             * @typedef {labflow.v1.JoinRequest.$Properties} labflow.v1.JoinRequest.$Shape
             */

            /**
             * Constructs a new JoinRequest.
             * @memberof labflow.v1
             * @classdesc Represents a JoinRequest.
             * @constructor
             * @param {labflow.v1.JoinRequest.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const JoinRequest = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * JoinRequest sessionId.
             * @member {string} sessionId
             * @memberof labflow.v1.JoinRequest
             * @instance
             */
            JoinRequest.prototype.sessionId = "";

            /**
             * JoinRequest apiKey.
             * @member {string} apiKey
             * @memberof labflow.v1.JoinRequest
             * @instance
             */
            JoinRequest.prototype.apiKey = "";

            /**
             * Creates a new JoinRequest instance using the specified properties.
             * @function create
             * @memberof labflow.v1.JoinRequest
             * @static
             * @param {labflow.v1.JoinRequest.$Properties=} [properties] Properties to set
             * @returns {labflow.v1.JoinRequest} JoinRequest instance
             * @type {{
             *   (properties: labflow.v1.JoinRequest.$Shape): labflow.v1.JoinRequest & labflow.v1.JoinRequest.$Shape;
             *   (properties?: labflow.v1.JoinRequest.$Properties): labflow.v1.JoinRequest;
             * }}
             */
            JoinRequest.create = function(properties) {
                return new JoinRequest(properties);
            };

            /**
             * Encodes the specified JoinRequest message. Does not implicitly {@link labflow.v1.JoinRequest.verify|verify} messages.
             * @function encode
             * @memberof labflow.v1.JoinRequest
             * @static
             * @param {labflow.v1.JoinRequest.$Properties} message JoinRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            JoinRequest.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId") && message.sessionId !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.sessionId);
                if (message.apiKey != null && $Object.hasOwnProperty.call(message, "apiKey") && message.apiKey !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.apiKey);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified JoinRequest message, length delimited. Does not implicitly {@link labflow.v1.JoinRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof labflow.v1.JoinRequest
             * @static
             * @param {labflow.v1.JoinRequest.$Properties} message JoinRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            JoinRequest.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a JoinRequest message from the specified reader or buffer.
             * @function decode
             * @memberof labflow.v1.JoinRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {labflow.v1.JoinRequest & labflow.v1.JoinRequest.$Shape} JoinRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            JoinRequest.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message, value;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.labflow.v1.JoinRequest();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.sessionId = value;
                            else
                                delete message.sessionId;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.apiKey = value;
                            else
                                delete message.apiKey;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a JoinRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof labflow.v1.JoinRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {labflow.v1.JoinRequest & labflow.v1.JoinRequest.$Shape} JoinRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            JoinRequest.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a JoinRequest message.
             * @function verify
             * @memberof labflow.v1.JoinRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            JoinRequest.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
                    if (!$util.isString(message.sessionId))
                        return "sessionId: string expected";
                if (message.apiKey != null && $Object.hasOwnProperty.call(message, "apiKey"))
                    if (!$util.isString(message.apiKey))
                        return "apiKey: string expected";
                return null;
            };

            /**
             * Creates a JoinRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof labflow.v1.JoinRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {labflow.v1.JoinRequest} JoinRequest
             */
            JoinRequest.fromObject = function (object, _depth) {
                if (object instanceof $root.labflow.v1.JoinRequest)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".labflow.v1.JoinRequest: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.labflow.v1.JoinRequest();
                if (object.sessionId != null)
                    if (typeof object.sessionId !== "string" || object.sessionId.length)
                        message.sessionId = $String(object.sessionId);
                if (object.apiKey != null)
                    if (typeof object.apiKey !== "string" || object.apiKey.length)
                        message.apiKey = $String(object.apiKey);
                return message;
            };

            /**
             * Creates a plain object from a JoinRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof labflow.v1.JoinRequest
             * @static
             * @param {labflow.v1.JoinRequest} message JoinRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            JoinRequest.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.sessionId = "";
                    object.apiKey = "";
                }
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
                    object.sessionId = message.sessionId;
                if (message.apiKey != null && $Object.hasOwnProperty.call(message, "apiKey"))
                    object.apiKey = message.apiKey;
                return object;
            };

            /**
             * Converts this JoinRequest to JSON.
             * @function toJSON
             * @memberof labflow.v1.JoinRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            JoinRequest.prototype.toJSON = function() {
                return JoinRequest.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for JoinRequest
             * @function getTypeUrl
             * @memberof labflow.v1.JoinRequest
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            JoinRequest.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/labflow.v1.JoinRequest";
            };

            return JoinRequest;
        })();

        v1.JoinResponse = (function() {

            /**
             * Properties of a JoinResponse.
             * @typedef {Object} labflow.v1.JoinResponse.$Properties
             * @property {boolean|null} [accepted] JoinResponse accepted
             * @property {string|null} [token] JoinResponse token
             * @property {string|null} [message] JoinResponse message
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a JoinResponse.
             * @memberof labflow.v1
             * @interface IJoinResponse
             * @augments labflow.v1.JoinResponse.$Properties
             * @deprecated Use labflow.v1.JoinResponse.$Properties instead.
             */

            /**
             * Shape of a JoinResponse.
             * @typedef {labflow.v1.JoinResponse.$Properties} labflow.v1.JoinResponse.$Shape
             */

            /**
             * Constructs a new JoinResponse.
             * @memberof labflow.v1
             * @classdesc Represents a JoinResponse.
             * @constructor
             * @param {labflow.v1.JoinResponse.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const JoinResponse = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * JoinResponse accepted.
             * @member {boolean} accepted
             * @memberof labflow.v1.JoinResponse
             * @instance
             */
            JoinResponse.prototype.accepted = false;

            /**
             * JoinResponse token.
             * @member {string} token
             * @memberof labflow.v1.JoinResponse
             * @instance
             */
            JoinResponse.prototype.token = "";

            /**
             * JoinResponse message.
             * @member {string} message
             * @memberof labflow.v1.JoinResponse
             * @instance
             */
            JoinResponse.prototype.message = "";

            /**
             * Creates a new JoinResponse instance using the specified properties.
             * @function create
             * @memberof labflow.v1.JoinResponse
             * @static
             * @param {labflow.v1.JoinResponse.$Properties=} [properties] Properties to set
             * @returns {labflow.v1.JoinResponse} JoinResponse instance
             * @type {{
             *   (properties: labflow.v1.JoinResponse.$Shape): labflow.v1.JoinResponse & labflow.v1.JoinResponse.$Shape;
             *   (properties?: labflow.v1.JoinResponse.$Properties): labflow.v1.JoinResponse;
             * }}
             */
            JoinResponse.create = function(properties) {
                return new JoinResponse(properties);
            };

            /**
             * Encodes the specified JoinResponse message. Does not implicitly {@link labflow.v1.JoinResponse.verify|verify} messages.
             * @function encode
             * @memberof labflow.v1.JoinResponse
             * @static
             * @param {labflow.v1.JoinResponse.$Properties} message JoinResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            JoinResponse.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.accepted != null && $Object.hasOwnProperty.call(message, "accepted") && message.accepted !== false)
                    writer.uint32(/* id 1, wireType 0 =*/8).bool(message.accepted);
                if (message.token != null && $Object.hasOwnProperty.call(message, "token") && message.token !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.token);
                if (message.message != null && $Object.hasOwnProperty.call(message, "message") && message.message !== "")
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.message);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified JoinResponse message, length delimited. Does not implicitly {@link labflow.v1.JoinResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof labflow.v1.JoinResponse
             * @static
             * @param {labflow.v1.JoinResponse.$Properties} message JoinResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            JoinResponse.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a JoinResponse message from the specified reader or buffer.
             * @function decode
             * @memberof labflow.v1.JoinResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {labflow.v1.JoinResponse & labflow.v1.JoinResponse.$Shape} JoinResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            JoinResponse.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message, value;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.labflow.v1.JoinResponse();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 0)
                                break;
                            if (value = reader.bool())
                                message.accepted = value;
                            else
                                delete message.accepted;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.token = value;
                            else
                                delete message.token;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.message = value;
                            else
                                delete message.message;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a JoinResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof labflow.v1.JoinResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {labflow.v1.JoinResponse & labflow.v1.JoinResponse.$Shape} JoinResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            JoinResponse.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a JoinResponse message.
             * @function verify
             * @memberof labflow.v1.JoinResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            JoinResponse.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.accepted != null && $Object.hasOwnProperty.call(message, "accepted"))
                    if (typeof message.accepted !== "boolean")
                        return "accepted: boolean expected";
                if (message.token != null && $Object.hasOwnProperty.call(message, "token"))
                    if (!$util.isString(message.token))
                        return "token: string expected";
                if (message.message != null && $Object.hasOwnProperty.call(message, "message"))
                    if (!$util.isString(message.message))
                        return "message: string expected";
                return null;
            };

            /**
             * Creates a JoinResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof labflow.v1.JoinResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {labflow.v1.JoinResponse} JoinResponse
             */
            JoinResponse.fromObject = function (object, _depth) {
                if (object instanceof $root.labflow.v1.JoinResponse)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".labflow.v1.JoinResponse: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.labflow.v1.JoinResponse();
                if (object.accepted != null)
                    if (object.accepted)
                        message.accepted = $Boolean(object.accepted);
                if (object.token != null)
                    if (typeof object.token !== "string" || object.token.length)
                        message.token = $String(object.token);
                if (object.message != null)
                    if (typeof object.message !== "string" || object.message.length)
                        message.message = $String(object.message);
                return message;
            };

            /**
             * Creates a plain object from a JoinResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof labflow.v1.JoinResponse
             * @static
             * @param {labflow.v1.JoinResponse} message JoinResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            JoinResponse.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.accepted = false;
                    object.token = "";
                    object.message = "";
                }
                if (message.accepted != null && $Object.hasOwnProperty.call(message, "accepted"))
                    object.accepted = message.accepted;
                if (message.token != null && $Object.hasOwnProperty.call(message, "token"))
                    object.token = message.token;
                if (message.message != null && $Object.hasOwnProperty.call(message, "message"))
                    object.message = message.message;
                return object;
            };

            /**
             * Converts this JoinResponse to JSON.
             * @function toJSON
             * @memberof labflow.v1.JoinResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            JoinResponse.prototype.toJSON = function() {
                return JoinResponse.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for JoinResponse
             * @function getTypeUrl
             * @memberof labflow.v1.JoinResponse
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            JoinResponse.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/labflow.v1.JoinResponse";
            };

            return JoinResponse;
        })();

        v1.TaskRequest = (function() {

            /**
             * Properties of a TaskRequest.
             * @typedef {Object} labflow.v1.TaskRequest.$Properties
             * @property {string|null} [taskId] TaskRequest taskId
             * @property {string|null} [sessionId] TaskRequest sessionId
             * @property {string|null} [payload] TaskRequest payload
             * @property {number|null} [priority] TaskRequest priority
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a TaskRequest.
             * @memberof labflow.v1
             * @interface ITaskRequest
             * @augments labflow.v1.TaskRequest.$Properties
             * @deprecated Use labflow.v1.TaskRequest.$Properties instead.
             */

            /**
             * Shape of a TaskRequest.
             * @typedef {labflow.v1.TaskRequest.$Properties} labflow.v1.TaskRequest.$Shape
             */

            /**
             * Constructs a new TaskRequest.
             * @memberof labflow.v1
             * @classdesc Represents a TaskRequest.
             * @constructor
             * @param {labflow.v1.TaskRequest.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const TaskRequest = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * TaskRequest taskId.
             * @member {string} taskId
             * @memberof labflow.v1.TaskRequest
             * @instance
             */
            TaskRequest.prototype.taskId = "";

            /**
             * TaskRequest sessionId.
             * @member {string} sessionId
             * @memberof labflow.v1.TaskRequest
             * @instance
             */
            TaskRequest.prototype.sessionId = "";

            /**
             * TaskRequest payload.
             * @member {string} payload
             * @memberof labflow.v1.TaskRequest
             * @instance
             */
            TaskRequest.prototype.payload = "";

            /**
             * TaskRequest priority.
             * @member {number} priority
             * @memberof labflow.v1.TaskRequest
             * @instance
             */
            TaskRequest.prototype.priority = 0;

            /**
             * Creates a new TaskRequest instance using the specified properties.
             * @function create
             * @memberof labflow.v1.TaskRequest
             * @static
             * @param {labflow.v1.TaskRequest.$Properties=} [properties] Properties to set
             * @returns {labflow.v1.TaskRequest} TaskRequest instance
             * @type {{
             *   (properties: labflow.v1.TaskRequest.$Shape): labflow.v1.TaskRequest & labflow.v1.TaskRequest.$Shape;
             *   (properties?: labflow.v1.TaskRequest.$Properties): labflow.v1.TaskRequest;
             * }}
             */
            TaskRequest.create = function(properties) {
                return new TaskRequest(properties);
            };

            /**
             * Encodes the specified TaskRequest message. Does not implicitly {@link labflow.v1.TaskRequest.verify|verify} messages.
             * @function encode
             * @memberof labflow.v1.TaskRequest
             * @static
             * @param {labflow.v1.TaskRequest.$Properties} message TaskRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TaskRequest.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.taskId != null && $Object.hasOwnProperty.call(message, "taskId") && message.taskId !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.taskId);
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId") && message.sessionId !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.sessionId);
                if (message.payload != null && $Object.hasOwnProperty.call(message, "payload") && message.payload !== "")
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.payload);
                if (message.priority != null && $Object.hasOwnProperty.call(message, "priority") && message.priority !== 0)
                    writer.uint32(/* id 4, wireType 0 =*/32).int32(message.priority);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified TaskRequest message, length delimited. Does not implicitly {@link labflow.v1.TaskRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof labflow.v1.TaskRequest
             * @static
             * @param {labflow.v1.TaskRequest.$Properties} message TaskRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TaskRequest.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a TaskRequest message from the specified reader or buffer.
             * @function decode
             * @memberof labflow.v1.TaskRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {labflow.v1.TaskRequest & labflow.v1.TaskRequest.$Shape} TaskRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TaskRequest.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message, value;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.labflow.v1.TaskRequest();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.taskId = value;
                            else
                                delete message.taskId;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.sessionId = value;
                            else
                                delete message.sessionId;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.payload = value;
                            else
                                delete message.payload;
                            continue;
                        }
                    case 4: {
                            if (wireType !== 0)
                                break;
                            if (value = reader.int32())
                                message.priority = value;
                            else
                                delete message.priority;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a TaskRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof labflow.v1.TaskRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {labflow.v1.TaskRequest & labflow.v1.TaskRequest.$Shape} TaskRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TaskRequest.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a TaskRequest message.
             * @function verify
             * @memberof labflow.v1.TaskRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            TaskRequest.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.taskId != null && $Object.hasOwnProperty.call(message, "taskId"))
                    if (!$util.isString(message.taskId))
                        return "taskId: string expected";
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
                    if (!$util.isString(message.sessionId))
                        return "sessionId: string expected";
                if (message.payload != null && $Object.hasOwnProperty.call(message, "payload"))
                    if (!$util.isString(message.payload))
                        return "payload: string expected";
                if (message.priority != null && $Object.hasOwnProperty.call(message, "priority"))
                    if (!$util.isInteger(message.priority))
                        return "priority: integer expected";
                return null;
            };

            /**
             * Creates a TaskRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof labflow.v1.TaskRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {labflow.v1.TaskRequest} TaskRequest
             */
            TaskRequest.fromObject = function (object, _depth) {
                if (object instanceof $root.labflow.v1.TaskRequest)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".labflow.v1.TaskRequest: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.labflow.v1.TaskRequest();
                if (object.taskId != null)
                    if (typeof object.taskId !== "string" || object.taskId.length)
                        message.taskId = $String(object.taskId);
                if (object.sessionId != null)
                    if (typeof object.sessionId !== "string" || object.sessionId.length)
                        message.sessionId = $String(object.sessionId);
                if (object.payload != null)
                    if (typeof object.payload !== "string" || object.payload.length)
                        message.payload = $String(object.payload);
                if (object.priority != null)
                    if ($Number(object.priority) !== 0)
                        message.priority = object.priority | 0;
                return message;
            };

            /**
             * Creates a plain object from a TaskRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof labflow.v1.TaskRequest
             * @static
             * @param {labflow.v1.TaskRequest} message TaskRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            TaskRequest.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.taskId = "";
                    object.sessionId = "";
                    object.payload = "";
                    object.priority = 0;
                }
                if (message.taskId != null && $Object.hasOwnProperty.call(message, "taskId"))
                    object.taskId = message.taskId;
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
                    object.sessionId = message.sessionId;
                if (message.payload != null && $Object.hasOwnProperty.call(message, "payload"))
                    object.payload = message.payload;
                if (message.priority != null && $Object.hasOwnProperty.call(message, "priority"))
                    object.priority = message.priority;
                return object;
            };

            /**
             * Converts this TaskRequest to JSON.
             * @function toJSON
             * @memberof labflow.v1.TaskRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TaskRequest.prototype.toJSON = function() {
                return TaskRequest.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for TaskRequest
             * @function getTypeUrl
             * @memberof labflow.v1.TaskRequest
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            TaskRequest.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/labflow.v1.TaskRequest";
            };

            return TaskRequest;
        })();

        v1.TaskResponse = (function() {

            /**
             * Properties of a TaskResponse.
             * @typedef {Object} labflow.v1.TaskResponse.$Properties
             * @property {string|null} [taskId] TaskResponse taskId
             * @property {string|null} [result] TaskResponse result
             * @property {labflow.v1.TaskStatus|null} [status] TaskResponse status
             * @property {string|null} [error] TaskResponse error
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a TaskResponse.
             * @memberof labflow.v1
             * @interface ITaskResponse
             * @augments labflow.v1.TaskResponse.$Properties
             * @deprecated Use labflow.v1.TaskResponse.$Properties instead.
             */

            /**
             * Shape of a TaskResponse.
             * @typedef {labflow.v1.TaskResponse.$Properties} labflow.v1.TaskResponse.$Shape
             */

            /**
             * Constructs a new TaskResponse.
             * @memberof labflow.v1
             * @classdesc Represents a TaskResponse.
             * @constructor
             * @param {labflow.v1.TaskResponse.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const TaskResponse = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * TaskResponse taskId.
             * @member {string} taskId
             * @memberof labflow.v1.TaskResponse
             * @instance
             */
            TaskResponse.prototype.taskId = "";

            /**
             * TaskResponse result.
             * @member {string} result
             * @memberof labflow.v1.TaskResponse
             * @instance
             */
            TaskResponse.prototype.result = "";

            /**
             * TaskResponse status.
             * @member {labflow.v1.TaskStatus} status
             * @memberof labflow.v1.TaskResponse
             * @instance
             */
            TaskResponse.prototype.status = 0;

            /**
             * TaskResponse error.
             * @member {string} error
             * @memberof labflow.v1.TaskResponse
             * @instance
             */
            TaskResponse.prototype.error = "";

            /**
             * Creates a new TaskResponse instance using the specified properties.
             * @function create
             * @memberof labflow.v1.TaskResponse
             * @static
             * @param {labflow.v1.TaskResponse.$Properties=} [properties] Properties to set
             * @returns {labflow.v1.TaskResponse} TaskResponse instance
             * @type {{
             *   (properties: labflow.v1.TaskResponse.$Shape): labflow.v1.TaskResponse & labflow.v1.TaskResponse.$Shape;
             *   (properties?: labflow.v1.TaskResponse.$Properties): labflow.v1.TaskResponse;
             * }}
             */
            TaskResponse.create = function(properties) {
                return new TaskResponse(properties);
            };

            /**
             * Encodes the specified TaskResponse message. Does not implicitly {@link labflow.v1.TaskResponse.verify|verify} messages.
             * @function encode
             * @memberof labflow.v1.TaskResponse
             * @static
             * @param {labflow.v1.TaskResponse.$Properties} message TaskResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TaskResponse.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.taskId != null && $Object.hasOwnProperty.call(message, "taskId") && message.taskId !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.taskId);
                if (message.result != null && $Object.hasOwnProperty.call(message, "result") && message.result !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.result);
                if (message.status != null && $Object.hasOwnProperty.call(message, "status") && message.status !== 0)
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.status);
                if (message.error != null && $Object.hasOwnProperty.call(message, "error") && message.error !== "")
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.error);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified TaskResponse message, length delimited. Does not implicitly {@link labflow.v1.TaskResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof labflow.v1.TaskResponse
             * @static
             * @param {labflow.v1.TaskResponse.$Properties} message TaskResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TaskResponse.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a TaskResponse message from the specified reader or buffer.
             * @function decode
             * @memberof labflow.v1.TaskResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {labflow.v1.TaskResponse & labflow.v1.TaskResponse.$Shape} TaskResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TaskResponse.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message, value;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.labflow.v1.TaskResponse();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.taskId = value;
                            else
                                delete message.taskId;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.result = value;
                            else
                                delete message.result;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 0)
                                break;
                            if (value = reader.int32())
                                message.status = value;
                            else
                                delete message.status;
                            continue;
                        }
                    case 4: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.error = value;
                            else
                                delete message.error;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a TaskResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof labflow.v1.TaskResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {labflow.v1.TaskResponse & labflow.v1.TaskResponse.$Shape} TaskResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TaskResponse.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a TaskResponse message.
             * @function verify
             * @memberof labflow.v1.TaskResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            TaskResponse.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.taskId != null && $Object.hasOwnProperty.call(message, "taskId"))
                    if (!$util.isString(message.taskId))
                        return "taskId: string expected";
                if (message.result != null && $Object.hasOwnProperty.call(message, "result"))
                    if (!$util.isString(message.result))
                        return "result: string expected";
                if (message.status != null && $Object.hasOwnProperty.call(message, "status"))
                    if (typeof message.status !== "number" || (message.status | 0) !== message.status)
                        return "status: enum value expected";
                if (message.error != null && $Object.hasOwnProperty.call(message, "error"))
                    if (!$util.isString(message.error))
                        return "error: string expected";
                return null;
            };

            /**
             * Creates a TaskResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof labflow.v1.TaskResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {labflow.v1.TaskResponse} TaskResponse
             */
            TaskResponse.fromObject = function (object, _depth) {
                if (object instanceof $root.labflow.v1.TaskResponse)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".labflow.v1.TaskResponse: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.labflow.v1.TaskResponse();
                if (object.taskId != null)
                    if (typeof object.taskId !== "string" || object.taskId.length)
                        message.taskId = $String(object.taskId);
                if (object.result != null)
                    if (typeof object.result !== "string" || object.result.length)
                        message.result = $String(object.result);
                if (object.status !== 0 && (typeof object.status !== "string" || $root.labflow.v1.TaskStatus[object.status] !== 0))
                    switch (object.status) {
                    case "TASK_STATUS_UNSPECIFIED":
                    case 0:
                        message.status = 0;
                        break;
                    case "TASK_STATUS_PENDING":
                    case 1:
                        message.status = 1;
                        break;
                    case "TASK_STATUS_RUNNING":
                    case 2:
                        message.status = 2;
                        break;
                    case "TASK_STATUS_DONE":
                    case 3:
                        message.status = 3;
                        break;
                    case "TASK_STATUS_FAILED":
                    case 4:
                        message.status = 4;
                        break;
                    default:
                        if (typeof object.status === "number" && (object.status | 0) === object.status)
                            message.status = object.status;
                    }
                if (object.error != null)
                    if (typeof object.error !== "string" || object.error.length)
                        message.error = $String(object.error);
                return message;
            };

            /**
             * Creates a plain object from a TaskResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof labflow.v1.TaskResponse
             * @static
             * @param {labflow.v1.TaskResponse} message TaskResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            TaskResponse.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.taskId = "";
                    object.result = "";
                    object.status = options.enums === $String ? "TASK_STATUS_UNSPECIFIED" : 0;
                    object.error = "";
                }
                if (message.taskId != null && $Object.hasOwnProperty.call(message, "taskId"))
                    object.taskId = message.taskId;
                if (message.result != null && $Object.hasOwnProperty.call(message, "result"))
                    object.result = message.result;
                if (message.status != null && $Object.hasOwnProperty.call(message, "status"))
                    object.status = options.enums === $String ? $root.labflow.v1.TaskStatus[message.status] === $undefined ? message.status : $root.labflow.v1.TaskStatus[message.status] : message.status;
                if (message.error != null && $Object.hasOwnProperty.call(message, "error"))
                    object.error = message.error;
                return object;
            };

            /**
             * Converts this TaskResponse to JSON.
             * @function toJSON
             * @memberof labflow.v1.TaskResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TaskResponse.prototype.toJSON = function() {
                return TaskResponse.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for TaskResponse
             * @function getTypeUrl
             * @memberof labflow.v1.TaskResponse
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            TaskResponse.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/labflow.v1.TaskResponse";
            };

            return TaskResponse;
        })();

        v1.ExecuteCodeRequest = (function() {

            /**
             * Properties of an ExecuteCodeRequest.
             * @typedef {Object} labflow.v1.ExecuteCodeRequest.$Properties
             * @property {string|null} [sessionId] ExecuteCodeRequest sessionId
             * @property {string|null} [code] ExecuteCodeRequest code
             * @property {string|null} [language] ExecuteCodeRequest language
             * @property {number|Long|null} [maxMemory] ExecuteCodeRequest maxMemory
             * @property {number|Long|null} [maxCpu] ExecuteCodeRequest maxCpu
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of an ExecuteCodeRequest.
             * @memberof labflow.v1
             * @interface IExecuteCodeRequest
             * @augments labflow.v1.ExecuteCodeRequest.$Properties
             * @deprecated Use labflow.v1.ExecuteCodeRequest.$Properties instead.
             */

            /**
             * Shape of an ExecuteCodeRequest.
             * @typedef {labflow.v1.ExecuteCodeRequest.$Properties} labflow.v1.ExecuteCodeRequest.$Shape
             */

            /**
             * Constructs a new ExecuteCodeRequest.
             * @memberof labflow.v1
             * @classdesc Represents an ExecuteCodeRequest.
             * @constructor
             * @param {labflow.v1.ExecuteCodeRequest.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const ExecuteCodeRequest = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * ExecuteCodeRequest sessionId.
             * @member {string} sessionId
             * @memberof labflow.v1.ExecuteCodeRequest
             * @instance
             */
            ExecuteCodeRequest.prototype.sessionId = "";

            /**
             * ExecuteCodeRequest code.
             * @member {string} code
             * @memberof labflow.v1.ExecuteCodeRequest
             * @instance
             */
            ExecuteCodeRequest.prototype.code = "";

            /**
             * ExecuteCodeRequest language.
             * @member {string} language
             * @memberof labflow.v1.ExecuteCodeRequest
             * @instance
             */
            ExecuteCodeRequest.prototype.language = "";

            /**
             * ExecuteCodeRequest maxMemory.
             * @member {number|Long} maxMemory
             * @memberof labflow.v1.ExecuteCodeRequest
             * @instance
             */
            ExecuteCodeRequest.prototype.maxMemory = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * ExecuteCodeRequest maxCpu.
             * @member {number|Long} maxCpu
             * @memberof labflow.v1.ExecuteCodeRequest
             * @instance
             */
            ExecuteCodeRequest.prototype.maxCpu = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * Creates a new ExecuteCodeRequest instance using the specified properties.
             * @function create
             * @memberof labflow.v1.ExecuteCodeRequest
             * @static
             * @param {labflow.v1.ExecuteCodeRequest.$Properties=} [properties] Properties to set
             * @returns {labflow.v1.ExecuteCodeRequest} ExecuteCodeRequest instance
             * @type {{
             *   (properties: labflow.v1.ExecuteCodeRequest.$Shape): labflow.v1.ExecuteCodeRequest & labflow.v1.ExecuteCodeRequest.$Shape;
             *   (properties?: labflow.v1.ExecuteCodeRequest.$Properties): labflow.v1.ExecuteCodeRequest;
             * }}
             */
            ExecuteCodeRequest.create = function(properties) {
                return new ExecuteCodeRequest(properties);
            };

            /**
             * Encodes the specified ExecuteCodeRequest message. Does not implicitly {@link labflow.v1.ExecuteCodeRequest.verify|verify} messages.
             * @function encode
             * @memberof labflow.v1.ExecuteCodeRequest
             * @static
             * @param {labflow.v1.ExecuteCodeRequest.$Properties} message ExecuteCodeRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ExecuteCodeRequest.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId") && message.sessionId !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.sessionId);
                if (message.code != null && $Object.hasOwnProperty.call(message, "code") && message.code !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.code);
                if (message.language != null && $Object.hasOwnProperty.call(message, "language") && message.language !== "")
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.language);
                if (message.maxMemory != null && $Object.hasOwnProperty.call(message, "maxMemory") && (typeof message.maxMemory === "object" ? message.maxMemory.low || message.maxMemory.high : message.maxMemory !== 0))
                    writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.maxMemory);
                if (message.maxCpu != null && $Object.hasOwnProperty.call(message, "maxCpu") && (typeof message.maxCpu === "object" ? message.maxCpu.low || message.maxCpu.high : message.maxCpu !== 0))
                    writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.maxCpu);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified ExecuteCodeRequest message, length delimited. Does not implicitly {@link labflow.v1.ExecuteCodeRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof labflow.v1.ExecuteCodeRequest
             * @static
             * @param {labflow.v1.ExecuteCodeRequest.$Properties} message ExecuteCodeRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ExecuteCodeRequest.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes an ExecuteCodeRequest message from the specified reader or buffer.
             * @function decode
             * @memberof labflow.v1.ExecuteCodeRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {labflow.v1.ExecuteCodeRequest & labflow.v1.ExecuteCodeRequest.$Shape} ExecuteCodeRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ExecuteCodeRequest.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message, value;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.labflow.v1.ExecuteCodeRequest();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.sessionId = value;
                            else
                                delete message.sessionId;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.code = value;
                            else
                                delete message.code;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.language = value;
                            else
                                delete message.language;
                            continue;
                        }
                    case 4: {
                            if (wireType !== 0)
                                break;
                            if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                message.maxMemory = value;
                            else
                                delete message.maxMemory;
                            continue;
                        }
                    case 5: {
                            if (wireType !== 0)
                                break;
                            if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                message.maxCpu = value;
                            else
                                delete message.maxCpu;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes an ExecuteCodeRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof labflow.v1.ExecuteCodeRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {labflow.v1.ExecuteCodeRequest & labflow.v1.ExecuteCodeRequest.$Shape} ExecuteCodeRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ExecuteCodeRequest.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an ExecuteCodeRequest message.
             * @function verify
             * @memberof labflow.v1.ExecuteCodeRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ExecuteCodeRequest.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
                    if (!$util.isString(message.sessionId))
                        return "sessionId: string expected";
                if (message.code != null && $Object.hasOwnProperty.call(message, "code"))
                    if (!$util.isString(message.code))
                        return "code: string expected";
                if (message.language != null && $Object.hasOwnProperty.call(message, "language"))
                    if (!$util.isString(message.language))
                        return "language: string expected";
                if (message.maxMemory != null && $Object.hasOwnProperty.call(message, "maxMemory"))
                    if (!$util.isInteger(message.maxMemory) && !(message.maxMemory && $util.isInteger(message.maxMemory.low) && $util.isInteger(message.maxMemory.high)))
                        return "maxMemory: integer|Long expected";
                if (message.maxCpu != null && $Object.hasOwnProperty.call(message, "maxCpu"))
                    if (!$util.isInteger(message.maxCpu) && !(message.maxCpu && $util.isInteger(message.maxCpu.low) && $util.isInteger(message.maxCpu.high)))
                        return "maxCpu: integer|Long expected";
                return null;
            };

            /**
             * Creates an ExecuteCodeRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof labflow.v1.ExecuteCodeRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {labflow.v1.ExecuteCodeRequest} ExecuteCodeRequest
             */
            ExecuteCodeRequest.fromObject = function (object, _depth) {
                if (object instanceof $root.labflow.v1.ExecuteCodeRequest)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".labflow.v1.ExecuteCodeRequest: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.labflow.v1.ExecuteCodeRequest();
                if (object.sessionId != null)
                    if (typeof object.sessionId !== "string" || object.sessionId.length)
                        message.sessionId = $String(object.sessionId);
                if (object.code != null)
                    if (typeof object.code !== "string" || object.code.length)
                        message.code = $String(object.code);
                if (object.language != null)
                    if (typeof object.language !== "string" || object.language.length)
                        message.language = $String(object.language);
                if (object.maxMemory != null)
                    if (typeof object.maxMemory === "object" ? object.maxMemory.low || object.maxMemory.high : $Number(object.maxMemory) !== 0)
                        if ($util.Long)
                            message.maxMemory = $util.Long.fromValue(object.maxMemory, true);
                        else if (typeof object.maxMemory === "string")
                            message.maxMemory = $parseInt(object.maxMemory, 10);
                        else if (typeof object.maxMemory === "number")
                            message.maxMemory = object.maxMemory;
                        else if (typeof object.maxMemory === "object")
                            message.maxMemory = new $util.LongBits(object.maxMemory.low >>> 0, object.maxMemory.high >>> 0).toNumber(true);
                if (object.maxCpu != null)
                    if (typeof object.maxCpu === "object" ? object.maxCpu.low || object.maxCpu.high : $Number(object.maxCpu) !== 0)
                        if ($util.Long)
                            message.maxCpu = $util.Long.fromValue(object.maxCpu, true);
                        else if (typeof object.maxCpu === "string")
                            message.maxCpu = $parseInt(object.maxCpu, 10);
                        else if (typeof object.maxCpu === "number")
                            message.maxCpu = object.maxCpu;
                        else if (typeof object.maxCpu === "object")
                            message.maxCpu = new $util.LongBits(object.maxCpu.low >>> 0, object.maxCpu.high >>> 0).toNumber(true);
                return message;
            };

            /**
             * Creates a plain object from an ExecuteCodeRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof labflow.v1.ExecuteCodeRequest
             * @static
             * @param {labflow.v1.ExecuteCodeRequest} message ExecuteCodeRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ExecuteCodeRequest.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.sessionId = "";
                    object.code = "";
                    object.language = "";
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, true);
                        object.maxMemory = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                    } else
                        object.maxMemory = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, true);
                        object.maxCpu = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                    } else
                        object.maxCpu = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                }
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
                    object.sessionId = message.sessionId;
                if (message.code != null && $Object.hasOwnProperty.call(message, "code"))
                    object.code = message.code;
                if (message.language != null && $Object.hasOwnProperty.call(message, "language"))
                    object.language = message.language;
                if (message.maxMemory != null && $Object.hasOwnProperty.call(message, "maxMemory"))
                    if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                        object.maxMemory = typeof message.maxMemory === "number" ? $BigInt(message.maxMemory) : $util.Long.fromBits(message.maxMemory.low >>> 0, message.maxMemory.high >>> 0, true).toBigInt();
                    else if (typeof message.maxMemory === "number")
                        object.maxMemory = options.longs === $String ? $String(message.maxMemory) : message.maxMemory;
                    else
                        object.maxMemory = options.longs === $String ? $util.Long.prototype.toString.call(message.maxMemory) : options.longs === $Number ? new $util.LongBits(message.maxMemory.low >>> 0, message.maxMemory.high >>> 0).toNumber(true) : message.maxMemory;
                if (message.maxCpu != null && $Object.hasOwnProperty.call(message, "maxCpu"))
                    if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                        object.maxCpu = typeof message.maxCpu === "number" ? $BigInt(message.maxCpu) : $util.Long.fromBits(message.maxCpu.low >>> 0, message.maxCpu.high >>> 0, true).toBigInt();
                    else if (typeof message.maxCpu === "number")
                        object.maxCpu = options.longs === $String ? $String(message.maxCpu) : message.maxCpu;
                    else
                        object.maxCpu = options.longs === $String ? $util.Long.prototype.toString.call(message.maxCpu) : options.longs === $Number ? new $util.LongBits(message.maxCpu.low >>> 0, message.maxCpu.high >>> 0).toNumber(true) : message.maxCpu;
                return object;
            };

            /**
             * Converts this ExecuteCodeRequest to JSON.
             * @function toJSON
             * @memberof labflow.v1.ExecuteCodeRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ExecuteCodeRequest.prototype.toJSON = function() {
                return ExecuteCodeRequest.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for ExecuteCodeRequest
             * @function getTypeUrl
             * @memberof labflow.v1.ExecuteCodeRequest
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            ExecuteCodeRequest.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/labflow.v1.ExecuteCodeRequest";
            };

            return ExecuteCodeRequest;
        })();

        v1.ExecuteCodeResponse = (function() {

            /**
             * Properties of an ExecuteCodeResponse.
             * @typedef {Object} labflow.v1.ExecuteCodeResponse.$Properties
             * @property {boolean|null} [success] ExecuteCodeResponse success
             * @property {string|null} [output] ExecuteCodeResponse output
             * @property {string|null} [error] ExecuteCodeResponse error
             * @property {number|Long|null} [memoryUsedBytes] ExecuteCodeResponse memoryUsedBytes
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of an ExecuteCodeResponse.
             * @memberof labflow.v1
             * @interface IExecuteCodeResponse
             * @augments labflow.v1.ExecuteCodeResponse.$Properties
             * @deprecated Use labflow.v1.ExecuteCodeResponse.$Properties instead.
             */

            /**
             * Shape of an ExecuteCodeResponse.
             * @typedef {labflow.v1.ExecuteCodeResponse.$Properties} labflow.v1.ExecuteCodeResponse.$Shape
             */

            /**
             * Constructs a new ExecuteCodeResponse.
             * @memberof labflow.v1
             * @classdesc Represents an ExecuteCodeResponse.
             * @constructor
             * @param {labflow.v1.ExecuteCodeResponse.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const ExecuteCodeResponse = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * ExecuteCodeResponse success.
             * @member {boolean} success
             * @memberof labflow.v1.ExecuteCodeResponse
             * @instance
             */
            ExecuteCodeResponse.prototype.success = false;

            /**
             * ExecuteCodeResponse output.
             * @member {string} output
             * @memberof labflow.v1.ExecuteCodeResponse
             * @instance
             */
            ExecuteCodeResponse.prototype.output = "";

            /**
             * ExecuteCodeResponse error.
             * @member {string} error
             * @memberof labflow.v1.ExecuteCodeResponse
             * @instance
             */
            ExecuteCodeResponse.prototype.error = "";

            /**
             * ExecuteCodeResponse memoryUsedBytes.
             * @member {number|Long} memoryUsedBytes
             * @memberof labflow.v1.ExecuteCodeResponse
             * @instance
             */
            ExecuteCodeResponse.prototype.memoryUsedBytes = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * Creates a new ExecuteCodeResponse instance using the specified properties.
             * @function create
             * @memberof labflow.v1.ExecuteCodeResponse
             * @static
             * @param {labflow.v1.ExecuteCodeResponse.$Properties=} [properties] Properties to set
             * @returns {labflow.v1.ExecuteCodeResponse} ExecuteCodeResponse instance
             * @type {{
             *   (properties: labflow.v1.ExecuteCodeResponse.$Shape): labflow.v1.ExecuteCodeResponse & labflow.v1.ExecuteCodeResponse.$Shape;
             *   (properties?: labflow.v1.ExecuteCodeResponse.$Properties): labflow.v1.ExecuteCodeResponse;
             * }}
             */
            ExecuteCodeResponse.create = function(properties) {
                return new ExecuteCodeResponse(properties);
            };

            /**
             * Encodes the specified ExecuteCodeResponse message. Does not implicitly {@link labflow.v1.ExecuteCodeResponse.verify|verify} messages.
             * @function encode
             * @memberof labflow.v1.ExecuteCodeResponse
             * @static
             * @param {labflow.v1.ExecuteCodeResponse.$Properties} message ExecuteCodeResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ExecuteCodeResponse.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.success != null && $Object.hasOwnProperty.call(message, "success") && message.success !== false)
                    writer.uint32(/* id 1, wireType 0 =*/8).bool(message.success);
                if (message.output != null && $Object.hasOwnProperty.call(message, "output") && message.output !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.output);
                if (message.error != null && $Object.hasOwnProperty.call(message, "error") && message.error !== "")
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.error);
                if (message.memoryUsedBytes != null && $Object.hasOwnProperty.call(message, "memoryUsedBytes") && (typeof message.memoryUsedBytes === "object" ? message.memoryUsedBytes.low || message.memoryUsedBytes.high : message.memoryUsedBytes !== 0))
                    writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.memoryUsedBytes);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified ExecuteCodeResponse message, length delimited. Does not implicitly {@link labflow.v1.ExecuteCodeResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof labflow.v1.ExecuteCodeResponse
             * @static
             * @param {labflow.v1.ExecuteCodeResponse.$Properties} message ExecuteCodeResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ExecuteCodeResponse.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes an ExecuteCodeResponse message from the specified reader or buffer.
             * @function decode
             * @memberof labflow.v1.ExecuteCodeResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {labflow.v1.ExecuteCodeResponse & labflow.v1.ExecuteCodeResponse.$Shape} ExecuteCodeResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ExecuteCodeResponse.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message, value;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.labflow.v1.ExecuteCodeResponse();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 0)
                                break;
                            if (value = reader.bool())
                                message.success = value;
                            else
                                delete message.success;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.output = value;
                            else
                                delete message.output;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.error = value;
                            else
                                delete message.error;
                            continue;
                        }
                    case 4: {
                            if (wireType !== 0)
                                break;
                            if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                message.memoryUsedBytes = value;
                            else
                                delete message.memoryUsedBytes;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes an ExecuteCodeResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof labflow.v1.ExecuteCodeResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {labflow.v1.ExecuteCodeResponse & labflow.v1.ExecuteCodeResponse.$Shape} ExecuteCodeResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ExecuteCodeResponse.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an ExecuteCodeResponse message.
             * @function verify
             * @memberof labflow.v1.ExecuteCodeResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ExecuteCodeResponse.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.success != null && $Object.hasOwnProperty.call(message, "success"))
                    if (typeof message.success !== "boolean")
                        return "success: boolean expected";
                if (message.output != null && $Object.hasOwnProperty.call(message, "output"))
                    if (!$util.isString(message.output))
                        return "output: string expected";
                if (message.error != null && $Object.hasOwnProperty.call(message, "error"))
                    if (!$util.isString(message.error))
                        return "error: string expected";
                if (message.memoryUsedBytes != null && $Object.hasOwnProperty.call(message, "memoryUsedBytes"))
                    if (!$util.isInteger(message.memoryUsedBytes) && !(message.memoryUsedBytes && $util.isInteger(message.memoryUsedBytes.low) && $util.isInteger(message.memoryUsedBytes.high)))
                        return "memoryUsedBytes: integer|Long expected";
                return null;
            };

            /**
             * Creates an ExecuteCodeResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof labflow.v1.ExecuteCodeResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {labflow.v1.ExecuteCodeResponse} ExecuteCodeResponse
             */
            ExecuteCodeResponse.fromObject = function (object, _depth) {
                if (object instanceof $root.labflow.v1.ExecuteCodeResponse)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".labflow.v1.ExecuteCodeResponse: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.labflow.v1.ExecuteCodeResponse();
                if (object.success != null)
                    if (object.success)
                        message.success = $Boolean(object.success);
                if (object.output != null)
                    if (typeof object.output !== "string" || object.output.length)
                        message.output = $String(object.output);
                if (object.error != null)
                    if (typeof object.error !== "string" || object.error.length)
                        message.error = $String(object.error);
                if (object.memoryUsedBytes != null)
                    if (typeof object.memoryUsedBytes === "object" ? object.memoryUsedBytes.low || object.memoryUsedBytes.high : $Number(object.memoryUsedBytes) !== 0)
                        if ($util.Long)
                            message.memoryUsedBytes = $util.Long.fromValue(object.memoryUsedBytes, true);
                        else if (typeof object.memoryUsedBytes === "string")
                            message.memoryUsedBytes = $parseInt(object.memoryUsedBytes, 10);
                        else if (typeof object.memoryUsedBytes === "number")
                            message.memoryUsedBytes = object.memoryUsedBytes;
                        else if (typeof object.memoryUsedBytes === "object")
                            message.memoryUsedBytes = new $util.LongBits(object.memoryUsedBytes.low >>> 0, object.memoryUsedBytes.high >>> 0).toNumber(true);
                return message;
            };

            /**
             * Creates a plain object from an ExecuteCodeResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof labflow.v1.ExecuteCodeResponse
             * @static
             * @param {labflow.v1.ExecuteCodeResponse} message ExecuteCodeResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ExecuteCodeResponse.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.success = false;
                    object.output = "";
                    object.error = "";
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, true);
                        object.memoryUsedBytes = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                    } else
                        object.memoryUsedBytes = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                }
                if (message.success != null && $Object.hasOwnProperty.call(message, "success"))
                    object.success = message.success;
                if (message.output != null && $Object.hasOwnProperty.call(message, "output"))
                    object.output = message.output;
                if (message.error != null && $Object.hasOwnProperty.call(message, "error"))
                    object.error = message.error;
                if (message.memoryUsedBytes != null && $Object.hasOwnProperty.call(message, "memoryUsedBytes"))
                    if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                        object.memoryUsedBytes = typeof message.memoryUsedBytes === "number" ? $BigInt(message.memoryUsedBytes) : $util.Long.fromBits(message.memoryUsedBytes.low >>> 0, message.memoryUsedBytes.high >>> 0, true).toBigInt();
                    else if (typeof message.memoryUsedBytes === "number")
                        object.memoryUsedBytes = options.longs === $String ? $String(message.memoryUsedBytes) : message.memoryUsedBytes;
                    else
                        object.memoryUsedBytes = options.longs === $String ? $util.Long.prototype.toString.call(message.memoryUsedBytes) : options.longs === $Number ? new $util.LongBits(message.memoryUsedBytes.low >>> 0, message.memoryUsedBytes.high >>> 0).toNumber(true) : message.memoryUsedBytes;
                return object;
            };

            /**
             * Converts this ExecuteCodeResponse to JSON.
             * @function toJSON
             * @memberof labflow.v1.ExecuteCodeResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ExecuteCodeResponse.prototype.toJSON = function() {
                return ExecuteCodeResponse.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for ExecuteCodeResponse
             * @function getTypeUrl
             * @memberof labflow.v1.ExecuteCodeResponse
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            ExecuteCodeResponse.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/labflow.v1.ExecuteCodeResponse";
            };

            return ExecuteCodeResponse;
        })();

        /**
         * TaskStatus enum.
         * @name labflow.v1.TaskStatus
         * @enum {number}
         * @property {number} TASK_STATUS_UNSPECIFIED=0 TASK_STATUS_UNSPECIFIED value
         * @property {number} TASK_STATUS_PENDING=1 TASK_STATUS_PENDING value
         * @property {number} TASK_STATUS_RUNNING=2 TASK_STATUS_RUNNING value
         * @property {number} TASK_STATUS_DONE=3 TASK_STATUS_DONE value
         * @property {number} TASK_STATUS_FAILED=4 TASK_STATUS_FAILED value
         */
        v1.TaskStatus = (function() {
            const valuesById = $Object.create(null), values = $Object.create(valuesById);
            values[valuesById[0] = "TASK_STATUS_UNSPECIFIED"] = 0;
            values[valuesById[1] = "TASK_STATUS_PENDING"] = 1;
            values[valuesById[2] = "TASK_STATUS_RUNNING"] = 2;
            values[valuesById[3] = "TASK_STATUS_DONE"] = 3;
            values[valuesById[4] = "TASK_STATUS_FAILED"] = 4;
            return values;
        })();

        v1.SandboxWriteRequest = (function() {

            /**
             * Properties of a SandboxWriteRequest.
             * @typedef {Object} labflow.v1.SandboxWriteRequest.$Properties
             * @property {string|null} [sessionId] SandboxWriteRequest sessionId
             * @property {number|Long|null} [offset] SandboxWriteRequest offset
             * @property {Uint8Array|null} [data] SandboxWriteRequest data
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a SandboxWriteRequest.
             * @memberof labflow.v1
             * @interface ISandboxWriteRequest
             * @augments labflow.v1.SandboxWriteRequest.$Properties
             * @deprecated Use labflow.v1.SandboxWriteRequest.$Properties instead.
             */

            /**
             * Shape of a SandboxWriteRequest.
             * @typedef {labflow.v1.SandboxWriteRequest.$Properties} labflow.v1.SandboxWriteRequest.$Shape
             */

            /**
             * Constructs a new SandboxWriteRequest.
             * @memberof labflow.v1
             * @classdesc Represents a SandboxWriteRequest.
             * @constructor
             * @param {labflow.v1.SandboxWriteRequest.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const SandboxWriteRequest = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * SandboxWriteRequest sessionId.
             * @member {string} sessionId
             * @memberof labflow.v1.SandboxWriteRequest
             * @instance
             */
            SandboxWriteRequest.prototype.sessionId = "";

            /**
             * SandboxWriteRequest offset.
             * @member {number|Long} offset
             * @memberof labflow.v1.SandboxWriteRequest
             * @instance
             */
            SandboxWriteRequest.prototype.offset = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * SandboxWriteRequest data.
             * @member {Uint8Array} data
             * @memberof labflow.v1.SandboxWriteRequest
             * @instance
             */
            SandboxWriteRequest.prototype.data = $util.newBuffer([]);

            /**
             * Creates a new SandboxWriteRequest instance using the specified properties.
             * @function create
             * @memberof labflow.v1.SandboxWriteRequest
             * @static
             * @param {labflow.v1.SandboxWriteRequest.$Properties=} [properties] Properties to set
             * @returns {labflow.v1.SandboxWriteRequest} SandboxWriteRequest instance
             * @type {{
             *   (properties: labflow.v1.SandboxWriteRequest.$Shape): labflow.v1.SandboxWriteRequest & labflow.v1.SandboxWriteRequest.$Shape;
             *   (properties?: labflow.v1.SandboxWriteRequest.$Properties): labflow.v1.SandboxWriteRequest;
             * }}
             */
            SandboxWriteRequest.create = function(properties) {
                return new SandboxWriteRequest(properties);
            };

            /**
             * Encodes the specified SandboxWriteRequest message. Does not implicitly {@link labflow.v1.SandboxWriteRequest.verify|verify} messages.
             * @function encode
             * @memberof labflow.v1.SandboxWriteRequest
             * @static
             * @param {labflow.v1.SandboxWriteRequest.$Properties} message SandboxWriteRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SandboxWriteRequest.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId") && message.sessionId !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.sessionId);
                if (message.offset != null && $Object.hasOwnProperty.call(message, "offset") && (typeof message.offset === "object" ? message.offset.low || message.offset.high : message.offset !== 0))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.offset);
                if (message.data != null && $Object.hasOwnProperty.call(message, "data") && message.data.length)
                    writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.data);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified SandboxWriteRequest message, length delimited. Does not implicitly {@link labflow.v1.SandboxWriteRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof labflow.v1.SandboxWriteRequest
             * @static
             * @param {labflow.v1.SandboxWriteRequest.$Properties} message SandboxWriteRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SandboxWriteRequest.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a SandboxWriteRequest message from the specified reader or buffer.
             * @function decode
             * @memberof labflow.v1.SandboxWriteRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {labflow.v1.SandboxWriteRequest & labflow.v1.SandboxWriteRequest.$Shape} SandboxWriteRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SandboxWriteRequest.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message, value;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.labflow.v1.SandboxWriteRequest();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.sessionId = value;
                            else
                                delete message.sessionId;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 0)
                                break;
                            if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                message.offset = value;
                            else
                                delete message.offset;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.bytes()).length)
                                message.data = value;
                            else
                                delete message.data;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a SandboxWriteRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof labflow.v1.SandboxWriteRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {labflow.v1.SandboxWriteRequest & labflow.v1.SandboxWriteRequest.$Shape} SandboxWriteRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SandboxWriteRequest.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a SandboxWriteRequest message.
             * @function verify
             * @memberof labflow.v1.SandboxWriteRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            SandboxWriteRequest.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
                    if (!$util.isString(message.sessionId))
                        return "sessionId: string expected";
                if (message.offset != null && $Object.hasOwnProperty.call(message, "offset"))
                    if (!$util.isInteger(message.offset) && !(message.offset && $util.isInteger(message.offset.low) && $util.isInteger(message.offset.high)))
                        return "offset: integer|Long expected";
                if (message.data != null && $Object.hasOwnProperty.call(message, "data"))
                    if (!(message.data && typeof message.data.length === "number" || $util.isString(message.data)))
                        return "data: buffer expected";
                return null;
            };

            /**
             * Creates a SandboxWriteRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof labflow.v1.SandboxWriteRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {labflow.v1.SandboxWriteRequest} SandboxWriteRequest
             */
            SandboxWriteRequest.fromObject = function (object, _depth) {
                if (object instanceof $root.labflow.v1.SandboxWriteRequest)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".labflow.v1.SandboxWriteRequest: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.labflow.v1.SandboxWriteRequest();
                if (object.sessionId != null)
                    if (typeof object.sessionId !== "string" || object.sessionId.length)
                        message.sessionId = $String(object.sessionId);
                if (object.offset != null)
                    if (typeof object.offset === "object" ? object.offset.low || object.offset.high : $Number(object.offset) !== 0)
                        if ($util.Long)
                            message.offset = $util.Long.fromValue(object.offset, true);
                        else if (typeof object.offset === "string")
                            message.offset = $parseInt(object.offset, 10);
                        else if (typeof object.offset === "number")
                            message.offset = object.offset;
                        else if (typeof object.offset === "object")
                            message.offset = new $util.LongBits(object.offset.low >>> 0, object.offset.high >>> 0).toNumber(true);
                if (object.data != null)
                    if (object.data.length)
                        if (typeof object.data === "string")
                            $util.base64.decode(object.data, message.data = $util.newBuffer($util.base64.length(object.data)), 0);
                        else if (object.data.length >= 0)
                            message.data = object.data;
                return message;
            };

            /**
             * Creates a plain object from a SandboxWriteRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof labflow.v1.SandboxWriteRequest
             * @static
             * @param {labflow.v1.SandboxWriteRequest} message SandboxWriteRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            SandboxWriteRequest.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.sessionId = "";
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, true);
                        object.offset = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                    } else
                        object.offset = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                    if (options.bytes === $String)
                        object.data = "";
                    else {
                        object.data = [];
                        if (options.bytes !== $Array)
                            object.data = $util.newBuffer(object.data);
                    }
                }
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
                    object.sessionId = message.sessionId;
                if (message.offset != null && $Object.hasOwnProperty.call(message, "offset"))
                    if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                        object.offset = typeof message.offset === "number" ? $BigInt(message.offset) : $util.Long.fromBits(message.offset.low >>> 0, message.offset.high >>> 0, true).toBigInt();
                    else if (typeof message.offset === "number")
                        object.offset = options.longs === $String ? $String(message.offset) : message.offset;
                    else
                        object.offset = options.longs === $String ? $util.Long.prototype.toString.call(message.offset) : options.longs === $Number ? new $util.LongBits(message.offset.low >>> 0, message.offset.high >>> 0).toNumber(true) : message.offset;
                if (message.data != null && $Object.hasOwnProperty.call(message, "data"))
                    object.data = options.bytes === $String ? $util.base64.encode(message.data, 0, message.data.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.data) : message.data;
                return object;
            };

            /**
             * Converts this SandboxWriteRequest to JSON.
             * @function toJSON
             * @memberof labflow.v1.SandboxWriteRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            SandboxWriteRequest.prototype.toJSON = function() {
                return SandboxWriteRequest.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for SandboxWriteRequest
             * @function getTypeUrl
             * @memberof labflow.v1.SandboxWriteRequest
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            SandboxWriteRequest.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/labflow.v1.SandboxWriteRequest";
            };

            return SandboxWriteRequest;
        })();

        v1.SandboxReadRequest = (function() {

            /**
             * Properties of a SandboxReadRequest.
             * @typedef {Object} labflow.v1.SandboxReadRequest.$Properties
             * @property {string|null} [sessionId] SandboxReadRequest sessionId
             * @property {number|Long|null} [offset] SandboxReadRequest offset
             * @property {number|null} [size] SandboxReadRequest size
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a SandboxReadRequest.
             * @memberof labflow.v1
             * @interface ISandboxReadRequest
             * @augments labflow.v1.SandboxReadRequest.$Properties
             * @deprecated Use labflow.v1.SandboxReadRequest.$Properties instead.
             */

            /**
             * Shape of a SandboxReadRequest.
             * @typedef {labflow.v1.SandboxReadRequest.$Properties} labflow.v1.SandboxReadRequest.$Shape
             */

            /**
             * Constructs a new SandboxReadRequest.
             * @memberof labflow.v1
             * @classdesc Represents a SandboxReadRequest.
             * @constructor
             * @param {labflow.v1.SandboxReadRequest.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const SandboxReadRequest = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * SandboxReadRequest sessionId.
             * @member {string} sessionId
             * @memberof labflow.v1.SandboxReadRequest
             * @instance
             */
            SandboxReadRequest.prototype.sessionId = "";

            /**
             * SandboxReadRequest offset.
             * @member {number|Long} offset
             * @memberof labflow.v1.SandboxReadRequest
             * @instance
             */
            SandboxReadRequest.prototype.offset = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * SandboxReadRequest size.
             * @member {number} size
             * @memberof labflow.v1.SandboxReadRequest
             * @instance
             */
            SandboxReadRequest.prototype.size = 0;

            /**
             * Creates a new SandboxReadRequest instance using the specified properties.
             * @function create
             * @memberof labflow.v1.SandboxReadRequest
             * @static
             * @param {labflow.v1.SandboxReadRequest.$Properties=} [properties] Properties to set
             * @returns {labflow.v1.SandboxReadRequest} SandboxReadRequest instance
             * @type {{
             *   (properties: labflow.v1.SandboxReadRequest.$Shape): labflow.v1.SandboxReadRequest & labflow.v1.SandboxReadRequest.$Shape;
             *   (properties?: labflow.v1.SandboxReadRequest.$Properties): labflow.v1.SandboxReadRequest;
             * }}
             */
            SandboxReadRequest.create = function(properties) {
                return new SandboxReadRequest(properties);
            };

            /**
             * Encodes the specified SandboxReadRequest message. Does not implicitly {@link labflow.v1.SandboxReadRequest.verify|verify} messages.
             * @function encode
             * @memberof labflow.v1.SandboxReadRequest
             * @static
             * @param {labflow.v1.SandboxReadRequest.$Properties} message SandboxReadRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SandboxReadRequest.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId") && message.sessionId !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.sessionId);
                if (message.offset != null && $Object.hasOwnProperty.call(message, "offset") && (typeof message.offset === "object" ? message.offset.low || message.offset.high : message.offset !== 0))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.offset);
                if (message.size != null && $Object.hasOwnProperty.call(message, "size") && message.size !== 0)
                    writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.size);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified SandboxReadRequest message, length delimited. Does not implicitly {@link labflow.v1.SandboxReadRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof labflow.v1.SandboxReadRequest
             * @static
             * @param {labflow.v1.SandboxReadRequest.$Properties} message SandboxReadRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SandboxReadRequest.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a SandboxReadRequest message from the specified reader or buffer.
             * @function decode
             * @memberof labflow.v1.SandboxReadRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {labflow.v1.SandboxReadRequest & labflow.v1.SandboxReadRequest.$Shape} SandboxReadRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SandboxReadRequest.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message, value;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.labflow.v1.SandboxReadRequest();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.sessionId = value;
                            else
                                delete message.sessionId;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 0)
                                break;
                            if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                                message.offset = value;
                            else
                                delete message.offset;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 0)
                                break;
                            if (value = reader.uint32())
                                message.size = value;
                            else
                                delete message.size;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a SandboxReadRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof labflow.v1.SandboxReadRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {labflow.v1.SandboxReadRequest & labflow.v1.SandboxReadRequest.$Shape} SandboxReadRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SandboxReadRequest.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a SandboxReadRequest message.
             * @function verify
             * @memberof labflow.v1.SandboxReadRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            SandboxReadRequest.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
                    if (!$util.isString(message.sessionId))
                        return "sessionId: string expected";
                if (message.offset != null && $Object.hasOwnProperty.call(message, "offset"))
                    if (!$util.isInteger(message.offset) && !(message.offset && $util.isInteger(message.offset.low) && $util.isInteger(message.offset.high)))
                        return "offset: integer|Long expected";
                if (message.size != null && $Object.hasOwnProperty.call(message, "size"))
                    if (!$util.isInteger(message.size))
                        return "size: integer expected";
                return null;
            };

            /**
             * Creates a SandboxReadRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof labflow.v1.SandboxReadRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {labflow.v1.SandboxReadRequest} SandboxReadRequest
             */
            SandboxReadRequest.fromObject = function (object, _depth) {
                if (object instanceof $root.labflow.v1.SandboxReadRequest)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".labflow.v1.SandboxReadRequest: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.labflow.v1.SandboxReadRequest();
                if (object.sessionId != null)
                    if (typeof object.sessionId !== "string" || object.sessionId.length)
                        message.sessionId = $String(object.sessionId);
                if (object.offset != null)
                    if (typeof object.offset === "object" ? object.offset.low || object.offset.high : $Number(object.offset) !== 0)
                        if ($util.Long)
                            message.offset = $util.Long.fromValue(object.offset, true);
                        else if (typeof object.offset === "string")
                            message.offset = $parseInt(object.offset, 10);
                        else if (typeof object.offset === "number")
                            message.offset = object.offset;
                        else if (typeof object.offset === "object")
                            message.offset = new $util.LongBits(object.offset.low >>> 0, object.offset.high >>> 0).toNumber(true);
                if (object.size != null)
                    if ($Number(object.size) !== 0)
                        message.size = object.size >>> 0;
                return message;
            };

            /**
             * Creates a plain object from a SandboxReadRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof labflow.v1.SandboxReadRequest
             * @static
             * @param {labflow.v1.SandboxReadRequest} message SandboxReadRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            SandboxReadRequest.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.sessionId = "";
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, true);
                        object.offset = options.longs === $String ? long.toString() : options.longs === $Number ? long.toNumber() : typeof $BigInt !== "undefined" && options.longs === $BigInt ? long.toBigInt() : long;
                    } else
                        object.offset = options.longs === $String ? "0" : typeof $BigInt !== "undefined" && options.longs === $BigInt ? $BigInt("0") : 0;
                    object.size = 0;
                }
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
                    object.sessionId = message.sessionId;
                if (message.offset != null && $Object.hasOwnProperty.call(message, "offset"))
                    if (typeof $BigInt !== "undefined" && options.longs === $BigInt)
                        object.offset = typeof message.offset === "number" ? $BigInt(message.offset) : $util.Long.fromBits(message.offset.low >>> 0, message.offset.high >>> 0, true).toBigInt();
                    else if (typeof message.offset === "number")
                        object.offset = options.longs === $String ? $String(message.offset) : message.offset;
                    else
                        object.offset = options.longs === $String ? $util.Long.prototype.toString.call(message.offset) : options.longs === $Number ? new $util.LongBits(message.offset.low >>> 0, message.offset.high >>> 0).toNumber(true) : message.offset;
                if (message.size != null && $Object.hasOwnProperty.call(message, "size"))
                    object.size = message.size;
                return object;
            };

            /**
             * Converts this SandboxReadRequest to JSON.
             * @function toJSON
             * @memberof labflow.v1.SandboxReadRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            SandboxReadRequest.prototype.toJSON = function() {
                return SandboxReadRequest.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for SandboxReadRequest
             * @function getTypeUrl
             * @memberof labflow.v1.SandboxReadRequest
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            SandboxReadRequest.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/labflow.v1.SandboxReadRequest";
            };

            return SandboxReadRequest;
        })();

        v1.SandboxReadResponse = (function() {

            /**
             * Properties of a SandboxReadResponse.
             * @typedef {Object} labflow.v1.SandboxReadResponse.$Properties
             * @property {Uint8Array|null} [data] SandboxReadResponse data
             * @property {boolean|null} [ok] SandboxReadResponse ok
             * @property {string|null} [error] SandboxReadResponse error
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a SandboxReadResponse.
             * @memberof labflow.v1
             * @interface ISandboxReadResponse
             * @augments labflow.v1.SandboxReadResponse.$Properties
             * @deprecated Use labflow.v1.SandboxReadResponse.$Properties instead.
             */

            /**
             * Shape of a SandboxReadResponse.
             * @typedef {labflow.v1.SandboxReadResponse.$Properties} labflow.v1.SandboxReadResponse.$Shape
             */

            /**
             * Constructs a new SandboxReadResponse.
             * @memberof labflow.v1
             * @classdesc Represents a SandboxReadResponse.
             * @constructor
             * @param {labflow.v1.SandboxReadResponse.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const SandboxReadResponse = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * SandboxReadResponse data.
             * @member {Uint8Array} data
             * @memberof labflow.v1.SandboxReadResponse
             * @instance
             */
            SandboxReadResponse.prototype.data = $util.newBuffer([]);

            /**
             * SandboxReadResponse ok.
             * @member {boolean} ok
             * @memberof labflow.v1.SandboxReadResponse
             * @instance
             */
            SandboxReadResponse.prototype.ok = false;

            /**
             * SandboxReadResponse error.
             * @member {string} error
             * @memberof labflow.v1.SandboxReadResponse
             * @instance
             */
            SandboxReadResponse.prototype.error = "";

            /**
             * Creates a new SandboxReadResponse instance using the specified properties.
             * @function create
             * @memberof labflow.v1.SandboxReadResponse
             * @static
             * @param {labflow.v1.SandboxReadResponse.$Properties=} [properties] Properties to set
             * @returns {labflow.v1.SandboxReadResponse} SandboxReadResponse instance
             * @type {{
             *   (properties: labflow.v1.SandboxReadResponse.$Shape): labflow.v1.SandboxReadResponse & labflow.v1.SandboxReadResponse.$Shape;
             *   (properties?: labflow.v1.SandboxReadResponse.$Properties): labflow.v1.SandboxReadResponse;
             * }}
             */
            SandboxReadResponse.create = function(properties) {
                return new SandboxReadResponse(properties);
            };

            /**
             * Encodes the specified SandboxReadResponse message. Does not implicitly {@link labflow.v1.SandboxReadResponse.verify|verify} messages.
             * @function encode
             * @memberof labflow.v1.SandboxReadResponse
             * @static
             * @param {labflow.v1.SandboxReadResponse.$Properties} message SandboxReadResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SandboxReadResponse.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.data != null && $Object.hasOwnProperty.call(message, "data") && message.data.length)
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.data);
                if (message.ok != null && $Object.hasOwnProperty.call(message, "ok") && message.ok !== false)
                    writer.uint32(/* id 2, wireType 0 =*/16).bool(message.ok);
                if (message.error != null && $Object.hasOwnProperty.call(message, "error") && message.error !== "")
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.error);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified SandboxReadResponse message, length delimited. Does not implicitly {@link labflow.v1.SandboxReadResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof labflow.v1.SandboxReadResponse
             * @static
             * @param {labflow.v1.SandboxReadResponse.$Properties} message SandboxReadResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SandboxReadResponse.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a SandboxReadResponse message from the specified reader or buffer.
             * @function decode
             * @memberof labflow.v1.SandboxReadResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {labflow.v1.SandboxReadResponse & labflow.v1.SandboxReadResponse.$Shape} SandboxReadResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SandboxReadResponse.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message, value;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.labflow.v1.SandboxReadResponse();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.bytes()).length)
                                message.data = value;
                            else
                                delete message.data;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 0)
                                break;
                            if (value = reader.bool())
                                message.ok = value;
                            else
                                delete message.ok;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.error = value;
                            else
                                delete message.error;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a SandboxReadResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof labflow.v1.SandboxReadResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {labflow.v1.SandboxReadResponse & labflow.v1.SandboxReadResponse.$Shape} SandboxReadResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SandboxReadResponse.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a SandboxReadResponse message.
             * @function verify
             * @memberof labflow.v1.SandboxReadResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            SandboxReadResponse.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.data != null && $Object.hasOwnProperty.call(message, "data"))
                    if (!(message.data && typeof message.data.length === "number" || $util.isString(message.data)))
                        return "data: buffer expected";
                if (message.ok != null && $Object.hasOwnProperty.call(message, "ok"))
                    if (typeof message.ok !== "boolean")
                        return "ok: boolean expected";
                if (message.error != null && $Object.hasOwnProperty.call(message, "error"))
                    if (!$util.isString(message.error))
                        return "error: string expected";
                return null;
            };

            /**
             * Creates a SandboxReadResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof labflow.v1.SandboxReadResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {labflow.v1.SandboxReadResponse} SandboxReadResponse
             */
            SandboxReadResponse.fromObject = function (object, _depth) {
                if (object instanceof $root.labflow.v1.SandboxReadResponse)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".labflow.v1.SandboxReadResponse: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.labflow.v1.SandboxReadResponse();
                if (object.data != null)
                    if (object.data.length)
                        if (typeof object.data === "string")
                            $util.base64.decode(object.data, message.data = $util.newBuffer($util.base64.length(object.data)), 0);
                        else if (object.data.length >= 0)
                            message.data = object.data;
                if (object.ok != null)
                    if (object.ok)
                        message.ok = $Boolean(object.ok);
                if (object.error != null)
                    if (typeof object.error !== "string" || object.error.length)
                        message.error = $String(object.error);
                return message;
            };

            /**
             * Creates a plain object from a SandboxReadResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof labflow.v1.SandboxReadResponse
             * @static
             * @param {labflow.v1.SandboxReadResponse} message SandboxReadResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            SandboxReadResponse.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    if (options.bytes === $String)
                        object.data = "";
                    else {
                        object.data = [];
                        if (options.bytes !== $Array)
                            object.data = $util.newBuffer(object.data);
                    }
                    object.ok = false;
                    object.error = "";
                }
                if (message.data != null && $Object.hasOwnProperty.call(message, "data"))
                    object.data = options.bytes === $String ? $util.base64.encode(message.data, 0, message.data.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.data) : message.data;
                if (message.ok != null && $Object.hasOwnProperty.call(message, "ok"))
                    object.ok = message.ok;
                if (message.error != null && $Object.hasOwnProperty.call(message, "error"))
                    object.error = message.error;
                return object;
            };

            /**
             * Converts this SandboxReadResponse to JSON.
             * @function toJSON
             * @memberof labflow.v1.SandboxReadResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            SandboxReadResponse.prototype.toJSON = function() {
                return SandboxReadResponse.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for SandboxReadResponse
             * @function getTypeUrl
             * @memberof labflow.v1.SandboxReadResponse
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            SandboxReadResponse.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/labflow.v1.SandboxReadResponse";
            };

            return SandboxReadResponse;
        })();

        v1.HostService = (function() {

            /**
             * Constructs a new HostService service.
             * @memberof labflow.v1
             * @classdesc Represents a HostService
             * @extends $protobuf.rpc.Service
             * @constructor
             * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
             * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
             * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
             */
            const HostService = function(rpcImpl, requestDelimited, responseDelimited) {
                $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
            };

            $Object.defineProperty(HostService.prototype = $Object.create($protobuf.rpc.Service.prototype), "constructor", { value: HostService, writable: true, enumerable: false, configurable: true });

            /**
             * Creates new HostService service using the specified rpc implementation.
             * @function create
             * @memberof labflow.v1.HostService
             * @static
             * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
             * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
             * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
             * @returns {HostService} RPC service. Useful where requests and/or responses are streamed.
             */
            HostService.create = function(rpcImpl, requestDelimited, responseDelimited) {
                return new this(rpcImpl, requestDelimited, responseDelimited);
            };

            /**
             * Callback as used by {@link labflow.v1.HostService#joinSession}.
             * @memberof labflow.v1.HostService
             * @typedef JoinSessionCallback
             * @type {function}
             * @param {Error|null} error Error, if any
             * @param {labflow.v1.JoinResponse} [response] JoinResponse
             */

            /**
             * Calls JoinSession.
             * @memberof labflow.v1.HostService
             * @typedef JoinSession
             * @type {{
             *   (request: labflow.v1.IJoinRequest, callback: labflow.v1.HostService.JoinSessionCallback): void;
             *   (request: labflow.v1.IJoinRequest): Promise<labflow.v1.JoinResponse>;
             *   readonly name: "JoinSession";
             *   readonly path: "/labflow.v1.HostService/JoinSession";
             *   readonly requestType: "JoinRequest";
             *   readonly responseType: "JoinResponse";
             *   readonly requestStream: undefined;
             *   readonly responseStream: undefined;
             * }}
             */

            /**
             * Calls JoinSession.
             * @name labflow.v1.HostService#joinSession
             * @type {labflow.v1.HostService.JoinSession}
             */
            $Object.defineProperties(HostService.prototype.joinSession = function(request, callback) {
                return $protobuf.rpc.Service.prototype.rpcCall.call(this, HostService.prototype.joinSession, $root.labflow.v1.JoinRequest, $root.labflow.v1.JoinResponse, request, callback);
            }, {
                name: { value: "JoinSession" },
                path: { value: "/labflow.v1.HostService/JoinSession" },
                requestType: { value: "JoinRequest" },
                responseType: { value: "JoinResponse" },
                requestStream: { value: $undefined },
                responseStream: { value: $undefined }
            });

            /**
             * Callback as used by {@link labflow.v1.HostService#submitTask}.
             * @memberof labflow.v1.HostService
             * @typedef SubmitTaskCallback
             * @type {function}
             * @param {Error|null} error Error, if any
             * @param {labflow.v1.TaskResponse} [response] TaskResponse
             */

            /**
             * Calls SubmitTask.
             * @memberof labflow.v1.HostService
             * @typedef SubmitTask
             * @type {{
             *   (request: labflow.v1.ITaskRequest, callback: labflow.v1.HostService.SubmitTaskCallback): void;
             *   (request: labflow.v1.ITaskRequest): Promise<labflow.v1.TaskResponse>;
             *   readonly name: "SubmitTask";
             *   readonly path: "/labflow.v1.HostService/SubmitTask";
             *   readonly requestType: "TaskRequest";
             *   readonly responseType: "TaskResponse";
             *   readonly requestStream: undefined;
             *   readonly responseStream: undefined;
             * }}
             */

            /**
             * Calls SubmitTask.
             * @name labflow.v1.HostService#submitTask
             * @type {labflow.v1.HostService.SubmitTask}
             */
            $Object.defineProperties(HostService.prototype.submitTask = function(request, callback) {
                return $protobuf.rpc.Service.prototype.rpcCall.call(this, HostService.prototype.submitTask, $root.labflow.v1.TaskRequest, $root.labflow.v1.TaskResponse, request, callback);
            }, {
                name: { value: "SubmitTask" },
                path: { value: "/labflow.v1.HostService/SubmitTask" },
                requestType: { value: "TaskRequest" },
                responseType: { value: "TaskResponse" },
                requestStream: { value: $undefined },
                responseStream: { value: $undefined }
            });

            /**
             * Callback as used by {@link labflow.v1.HostService#sandboxWrite}.
             * @memberof labflow.v1.HostService
             * @typedef SandboxWriteCallback
             * @type {function}
             * @param {Error|null} error Error, if any
             * @param {labflow.v1.SandboxReadResponse} [response] SandboxReadResponse
             */

            /**
             * Calls SandboxWrite.
             * @memberof labflow.v1.HostService
             * @typedef SandboxWrite
             * @type {{
             *   (request: labflow.v1.ISandboxWriteRequest, callback: labflow.v1.HostService.SandboxWriteCallback): void;
             *   (request: labflow.v1.ISandboxWriteRequest): Promise<labflow.v1.SandboxReadResponse>;
             *   readonly name: "SandboxWrite";
             *   readonly path: "/labflow.v1.HostService/SandboxWrite";
             *   readonly requestType: "SandboxWriteRequest";
             *   readonly responseType: "SandboxReadResponse";
             *   readonly requestStream: undefined;
             *   readonly responseStream: undefined;
             * }}
             */

            /**
             * Calls SandboxWrite.
             * @name labflow.v1.HostService#sandboxWrite
             * @type {labflow.v1.HostService.SandboxWrite}
             */
            $Object.defineProperties(HostService.prototype.sandboxWrite = function(request, callback) {
                return $protobuf.rpc.Service.prototype.rpcCall.call(this, HostService.prototype.sandboxWrite, $root.labflow.v1.SandboxWriteRequest, $root.labflow.v1.SandboxReadResponse, request, callback);
            }, {
                name: { value: "SandboxWrite" },
                path: { value: "/labflow.v1.HostService/SandboxWrite" },
                requestType: { value: "SandboxWriteRequest" },
                responseType: { value: "SandboxReadResponse" },
                requestStream: { value: $undefined },
                responseStream: { value: $undefined }
            });

            /**
             * Callback as used by {@link labflow.v1.HostService#sandboxRead}.
             * @memberof labflow.v1.HostService
             * @typedef SandboxReadCallback
             * @type {function}
             * @param {Error|null} error Error, if any
             * @param {labflow.v1.SandboxReadResponse} [response] SandboxReadResponse
             */

            /**
             * Calls SandboxRead.
             * @memberof labflow.v1.HostService
             * @typedef SandboxRead
             * @type {{
             *   (request: labflow.v1.ISandboxReadRequest, callback: labflow.v1.HostService.SandboxReadCallback): void;
             *   (request: labflow.v1.ISandboxReadRequest): Promise<labflow.v1.SandboxReadResponse>;
             *   readonly name: "SandboxRead";
             *   readonly path: "/labflow.v1.HostService/SandboxRead";
             *   readonly requestType: "SandboxReadRequest";
             *   readonly responseType: "SandboxReadResponse";
             *   readonly requestStream: undefined;
             *   readonly responseStream: undefined;
             * }}
             */

            /**
             * Calls SandboxRead.
             * @name labflow.v1.HostService#sandboxRead
             * @type {labflow.v1.HostService.SandboxRead}
             */
            $Object.defineProperties(HostService.prototype.sandboxRead = function(request, callback) {
                return $protobuf.rpc.Service.prototype.rpcCall.call(this, HostService.prototype.sandboxRead, $root.labflow.v1.SandboxReadRequest, $root.labflow.v1.SandboxReadResponse, request, callback);
            }, {
                name: { value: "SandboxRead" },
                path: { value: "/labflow.v1.HostService/SandboxRead" },
                requestType: { value: "SandboxReadRequest" },
                responseType: { value: "SandboxReadResponse" },
                requestStream: { value: $undefined },
                responseStream: { value: $undefined }
            });

            return HostService;
        })();

        v1.AgentService = (function() {

            /**
             * Constructs a new AgentService service.
             * @memberof labflow.v1
             * @classdesc Represents an AgentService
             * @extends $protobuf.rpc.Service
             * @constructor
             * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
             * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
             * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
             */
            const AgentService = function(rpcImpl, requestDelimited, responseDelimited) {
                $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
            };

            $Object.defineProperty(AgentService.prototype = $Object.create($protobuf.rpc.Service.prototype), "constructor", { value: AgentService, writable: true, enumerable: false, configurable: true });

            /**
             * Creates new AgentService service using the specified rpc implementation.
             * @function create
             * @memberof labflow.v1.AgentService
             * @static
             * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
             * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
             * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
             * @returns {AgentService} RPC service. Useful where requests and/or responses are streamed.
             */
            AgentService.create = function(rpcImpl, requestDelimited, responseDelimited) {
                return new this(rpcImpl, requestDelimited, responseDelimited);
            };

            /**
             * Callback as used by {@link labflow.v1.AgentService#executeTask}.
             * @memberof labflow.v1.AgentService
             * @typedef ExecuteTaskCallback
             * @type {function}
             * @param {Error|null} error Error, if any
             * @param {labflow.v1.TaskResponse} [response] TaskResponse
             */

            /**
             * Calls ExecuteTask.
             * @memberof labflow.v1.AgentService
             * @typedef ExecuteTask
             * @type {{
             *   (request: labflow.v1.ITaskRequest, callback: labflow.v1.AgentService.ExecuteTaskCallback): void;
             *   (request: labflow.v1.ITaskRequest): Promise<labflow.v1.TaskResponse>;
             *   readonly name: "ExecuteTask";
             *   readonly path: "/labflow.v1.AgentService/ExecuteTask";
             *   readonly requestType: "TaskRequest";
             *   readonly responseType: "TaskResponse";
             *   readonly requestStream: undefined;
             *   readonly responseStream: true;
             * }}
             */

            /**
             * Calls ExecuteTask.
             * @name labflow.v1.AgentService#executeTask
             * @type {labflow.v1.AgentService.ExecuteTask}
             */
            $Object.defineProperties(AgentService.prototype.executeTask = function(request, callback) {
                return $protobuf.rpc.Service.prototype.rpcCall.call(this, AgentService.prototype.executeTask, $root.labflow.v1.TaskRequest, $root.labflow.v1.TaskResponse, request, callback);
            }, {
                name: { value: "ExecuteTask" },
                path: { value: "/labflow.v1.AgentService/ExecuteTask" },
                requestType: { value: "TaskRequest" },
                responseType: { value: "TaskResponse" },
                requestStream: { value: $undefined },
                responseStream: { value: true }
            });

            /**
             * Callback as used by {@link labflow.v1.AgentService#executeCode}.
             * @memberof labflow.v1.AgentService
             * @typedef ExecuteCodeCallback
             * @type {function}
             * @param {Error|null} error Error, if any
             * @param {labflow.v1.ExecuteCodeResponse} [response] ExecuteCodeResponse
             */

            /**
             * Calls ExecuteCode.
             * @memberof labflow.v1.AgentService
             * @typedef ExecuteCode
             * @type {{
             *   (request: labflow.v1.IExecuteCodeRequest, callback: labflow.v1.AgentService.ExecuteCodeCallback): void;
             *   (request: labflow.v1.IExecuteCodeRequest): Promise<labflow.v1.ExecuteCodeResponse>;
             *   readonly name: "ExecuteCode";
             *   readonly path: "/labflow.v1.AgentService/ExecuteCode";
             *   readonly requestType: "ExecuteCodeRequest";
             *   readonly responseType: "ExecuteCodeResponse";
             *   readonly requestStream: undefined;
             *   readonly responseStream: undefined;
             * }}
             */

            /**
             * Calls ExecuteCode.
             * @name labflow.v1.AgentService#executeCode
             * @type {labflow.v1.AgentService.ExecuteCode}
             */
            $Object.defineProperties(AgentService.prototype.executeCode = function(request, callback) {
                return $protobuf.rpc.Service.prototype.rpcCall.call(this, AgentService.prototype.executeCode, $root.labflow.v1.ExecuteCodeRequest, $root.labflow.v1.ExecuteCodeResponse, request, callback);
            }, {
                name: { value: "ExecuteCode" },
                path: { value: "/labflow.v1.AgentService/ExecuteCode" },
                requestType: { value: "ExecuteCodeRequest" },
                responseType: { value: "ExecuteCodeResponse" },
                requestStream: { value: $undefined },
                responseStream: { value: $undefined }
            });

            /**
             * Callback as used by {@link labflow.v1.AgentService#agentEventStream}.
             * @memberof labflow.v1.AgentService
             * @typedef AgentEventStreamCallback
             * @type {function}
             * @param {Error|null} error Error, if any
             * @param {labflow.v1.AgentEventResponse} [response] AgentEventResponse
             */

            /**
             * Calls AgentEventStream.
             * @memberof labflow.v1.AgentService
             * @typedef AgentEventStream
             * @type {{
             *   (request: labflow.v1.IAgentEventRequest, callback: labflow.v1.AgentService.AgentEventStreamCallback): void;
             *   (request: labflow.v1.IAgentEventRequest): Promise<labflow.v1.AgentEventResponse>;
             *   readonly name: "AgentEventStream";
             *   readonly path: "/labflow.v1.AgentService/AgentEventStream";
             *   readonly requestType: "AgentEventRequest";
             *   readonly responseType: "AgentEventResponse";
             *   readonly requestStream: true;
             *   readonly responseStream: true;
             * }}
             */

            /**
             * Calls AgentEventStream.
             * @name labflow.v1.AgentService#agentEventStream
             * @type {labflow.v1.AgentService.AgentEventStream}
             */
            $Object.defineProperties(AgentService.prototype.agentEventStream = function(request, callback) {
                return $protobuf.rpc.Service.prototype.rpcCall.call(this, AgentService.prototype.agentEventStream, $root.labflow.v1.AgentEventRequest, $root.labflow.v1.AgentEventResponse, request, callback);
            }, {
                name: { value: "AgentEventStream" },
                path: { value: "/labflow.v1.AgentService/AgentEventStream" },
                requestType: { value: "AgentEventRequest" },
                responseType: { value: "AgentEventResponse" },
                requestStream: { value: true },
                responseStream: { value: true }
            });

            return AgentService;
        })();

        v1.ChartState = (function() {

            /**
             * Properties of a ChartState.
             * @typedef {Object} labflow.v1.ChartState.$Properties
             * @property {string|null} [chartId] ChartState chartId
             * @property {string|null} [type] ChartState type
             * @property {Uint8Array|null} [data] ChartState data
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a ChartState.
             * @memberof labflow.v1
             * @interface IChartState
             * @augments labflow.v1.ChartState.$Properties
             * @deprecated Use labflow.v1.ChartState.$Properties instead.
             */

            /**
             * Shape of a ChartState.
             * @typedef {labflow.v1.ChartState.$Properties} labflow.v1.ChartState.$Shape
             */

            /**
             * Constructs a new ChartState.
             * @memberof labflow.v1
             * @classdesc Represents a ChartState.
             * @constructor
             * @param {labflow.v1.ChartState.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const ChartState = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * ChartState chartId.
             * @member {string} chartId
             * @memberof labflow.v1.ChartState
             * @instance
             */
            ChartState.prototype.chartId = "";

            /**
             * ChartState type.
             * @member {string} type
             * @memberof labflow.v1.ChartState
             * @instance
             */
            ChartState.prototype.type = "";

            /**
             * ChartState data.
             * @member {Uint8Array} data
             * @memberof labflow.v1.ChartState
             * @instance
             */
            ChartState.prototype.data = $util.newBuffer([]);

            /**
             * Creates a new ChartState instance using the specified properties.
             * @function create
             * @memberof labflow.v1.ChartState
             * @static
             * @param {labflow.v1.ChartState.$Properties=} [properties] Properties to set
             * @returns {labflow.v1.ChartState} ChartState instance
             * @type {{
             *   (properties: labflow.v1.ChartState.$Shape): labflow.v1.ChartState & labflow.v1.ChartState.$Shape;
             *   (properties?: labflow.v1.ChartState.$Properties): labflow.v1.ChartState;
             * }}
             */
            ChartState.create = function(properties) {
                return new ChartState(properties);
            };

            /**
             * Encodes the specified ChartState message. Does not implicitly {@link labflow.v1.ChartState.verify|verify} messages.
             * @function encode
             * @memberof labflow.v1.ChartState
             * @static
             * @param {labflow.v1.ChartState.$Properties} message ChartState message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ChartState.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.chartId != null && $Object.hasOwnProperty.call(message, "chartId") && message.chartId !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.chartId);
                if (message.type != null && $Object.hasOwnProperty.call(message, "type") && message.type !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.type);
                if (message.data != null && $Object.hasOwnProperty.call(message, "data") && message.data.length)
                    writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.data);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified ChartState message, length delimited. Does not implicitly {@link labflow.v1.ChartState.verify|verify} messages.
             * @function encodeDelimited
             * @memberof labflow.v1.ChartState
             * @static
             * @param {labflow.v1.ChartState.$Properties} message ChartState message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ChartState.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a ChartState message from the specified reader or buffer.
             * @function decode
             * @memberof labflow.v1.ChartState
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {labflow.v1.ChartState & labflow.v1.ChartState.$Shape} ChartState
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ChartState.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message, value;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.labflow.v1.ChartState();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.chartId = value;
                            else
                                delete message.chartId;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.type = value;
                            else
                                delete message.type;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.bytes()).length)
                                message.data = value;
                            else
                                delete message.data;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a ChartState message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof labflow.v1.ChartState
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {labflow.v1.ChartState & labflow.v1.ChartState.$Shape} ChartState
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ChartState.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ChartState message.
             * @function verify
             * @memberof labflow.v1.ChartState
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ChartState.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.chartId != null && $Object.hasOwnProperty.call(message, "chartId"))
                    if (!$util.isString(message.chartId))
                        return "chartId: string expected";
                if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
                    if (!$util.isString(message.type))
                        return "type: string expected";
                if (message.data != null && $Object.hasOwnProperty.call(message, "data"))
                    if (!(message.data && typeof message.data.length === "number" || $util.isString(message.data)))
                        return "data: buffer expected";
                return null;
            };

            /**
             * Creates a ChartState message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof labflow.v1.ChartState
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {labflow.v1.ChartState} ChartState
             */
            ChartState.fromObject = function (object, _depth) {
                if (object instanceof $root.labflow.v1.ChartState)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".labflow.v1.ChartState: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.labflow.v1.ChartState();
                if (object.chartId != null)
                    if (typeof object.chartId !== "string" || object.chartId.length)
                        message.chartId = $String(object.chartId);
                if (object.type != null)
                    if (typeof object.type !== "string" || object.type.length)
                        message.type = $String(object.type);
                if (object.data != null)
                    if (object.data.length)
                        if (typeof object.data === "string")
                            $util.base64.decode(object.data, message.data = $util.newBuffer($util.base64.length(object.data)), 0);
                        else if (object.data.length >= 0)
                            message.data = object.data;
                return message;
            };

            /**
             * Creates a plain object from a ChartState message. Also converts values to other types if specified.
             * @function toObject
             * @memberof labflow.v1.ChartState
             * @static
             * @param {labflow.v1.ChartState} message ChartState
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ChartState.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.chartId = "";
                    object.type = "";
                    if (options.bytes === $String)
                        object.data = "";
                    else {
                        object.data = [];
                        if (options.bytes !== $Array)
                            object.data = $util.newBuffer(object.data);
                    }
                }
                if (message.chartId != null && $Object.hasOwnProperty.call(message, "chartId"))
                    object.chartId = message.chartId;
                if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
                    object.type = message.type;
                if (message.data != null && $Object.hasOwnProperty.call(message, "data"))
                    object.data = options.bytes === $String ? $util.base64.encode(message.data, 0, message.data.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.data) : message.data;
                return object;
            };

            /**
             * Converts this ChartState to JSON.
             * @function toJSON
             * @memberof labflow.v1.ChartState
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ChartState.prototype.toJSON = function() {
                return ChartState.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for ChartState
             * @function getTypeUrl
             * @memberof labflow.v1.ChartState
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            ChartState.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/labflow.v1.ChartState";
            };

            return ChartState;
        })();

        v1.ChemicalStructure = (function() {

            /**
             * Properties of a ChemicalStructure.
             * @typedef {Object} labflow.v1.ChemicalStructure.$Properties
             * @property {string|null} [structureId] ChemicalStructure structureId
             * @property {string|null} [format] ChemicalStructure format
             * @property {string|null} [payload] ChemicalStructure payload
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a ChemicalStructure.
             * @memberof labflow.v1
             * @interface IChemicalStructure
             * @augments labflow.v1.ChemicalStructure.$Properties
             * @deprecated Use labflow.v1.ChemicalStructure.$Properties instead.
             */

            /**
             * Shape of a ChemicalStructure.
             * @typedef {labflow.v1.ChemicalStructure.$Properties} labflow.v1.ChemicalStructure.$Shape
             */

            /**
             * Constructs a new ChemicalStructure.
             * @memberof labflow.v1
             * @classdesc Represents a ChemicalStructure.
             * @constructor
             * @param {labflow.v1.ChemicalStructure.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const ChemicalStructure = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * ChemicalStructure structureId.
             * @member {string} structureId
             * @memberof labflow.v1.ChemicalStructure
             * @instance
             */
            ChemicalStructure.prototype.structureId = "";

            /**
             * ChemicalStructure format.
             * @member {string} format
             * @memberof labflow.v1.ChemicalStructure
             * @instance
             */
            ChemicalStructure.prototype.format = "";

            /**
             * ChemicalStructure payload.
             * @member {string} payload
             * @memberof labflow.v1.ChemicalStructure
             * @instance
             */
            ChemicalStructure.prototype.payload = "";

            /**
             * Creates a new ChemicalStructure instance using the specified properties.
             * @function create
             * @memberof labflow.v1.ChemicalStructure
             * @static
             * @param {labflow.v1.ChemicalStructure.$Properties=} [properties] Properties to set
             * @returns {labflow.v1.ChemicalStructure} ChemicalStructure instance
             * @type {{
             *   (properties: labflow.v1.ChemicalStructure.$Shape): labflow.v1.ChemicalStructure & labflow.v1.ChemicalStructure.$Shape;
             *   (properties?: labflow.v1.ChemicalStructure.$Properties): labflow.v1.ChemicalStructure;
             * }}
             */
            ChemicalStructure.create = function(properties) {
                return new ChemicalStructure(properties);
            };

            /**
             * Encodes the specified ChemicalStructure message. Does not implicitly {@link labflow.v1.ChemicalStructure.verify|verify} messages.
             * @function encode
             * @memberof labflow.v1.ChemicalStructure
             * @static
             * @param {labflow.v1.ChemicalStructure.$Properties} message ChemicalStructure message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ChemicalStructure.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.structureId != null && $Object.hasOwnProperty.call(message, "structureId") && message.structureId !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.structureId);
                if (message.format != null && $Object.hasOwnProperty.call(message, "format") && message.format !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.format);
                if (message.payload != null && $Object.hasOwnProperty.call(message, "payload") && message.payload !== "")
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.payload);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified ChemicalStructure message, length delimited. Does not implicitly {@link labflow.v1.ChemicalStructure.verify|verify} messages.
             * @function encodeDelimited
             * @memberof labflow.v1.ChemicalStructure
             * @static
             * @param {labflow.v1.ChemicalStructure.$Properties} message ChemicalStructure message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ChemicalStructure.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a ChemicalStructure message from the specified reader or buffer.
             * @function decode
             * @memberof labflow.v1.ChemicalStructure
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {labflow.v1.ChemicalStructure & labflow.v1.ChemicalStructure.$Shape} ChemicalStructure
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ChemicalStructure.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message, value;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.labflow.v1.ChemicalStructure();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.structureId = value;
                            else
                                delete message.structureId;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.format = value;
                            else
                                delete message.format;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.payload = value;
                            else
                                delete message.payload;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a ChemicalStructure message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof labflow.v1.ChemicalStructure
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {labflow.v1.ChemicalStructure & labflow.v1.ChemicalStructure.$Shape} ChemicalStructure
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ChemicalStructure.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ChemicalStructure message.
             * @function verify
             * @memberof labflow.v1.ChemicalStructure
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ChemicalStructure.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.structureId != null && $Object.hasOwnProperty.call(message, "structureId"))
                    if (!$util.isString(message.structureId))
                        return "structureId: string expected";
                if (message.format != null && $Object.hasOwnProperty.call(message, "format"))
                    if (!$util.isString(message.format))
                        return "format: string expected";
                if (message.payload != null && $Object.hasOwnProperty.call(message, "payload"))
                    if (!$util.isString(message.payload))
                        return "payload: string expected";
                return null;
            };

            /**
             * Creates a ChemicalStructure message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof labflow.v1.ChemicalStructure
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {labflow.v1.ChemicalStructure} ChemicalStructure
             */
            ChemicalStructure.fromObject = function (object, _depth) {
                if (object instanceof $root.labflow.v1.ChemicalStructure)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".labflow.v1.ChemicalStructure: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.labflow.v1.ChemicalStructure();
                if (object.structureId != null)
                    if (typeof object.structureId !== "string" || object.structureId.length)
                        message.structureId = $String(object.structureId);
                if (object.format != null)
                    if (typeof object.format !== "string" || object.format.length)
                        message.format = $String(object.format);
                if (object.payload != null)
                    if (typeof object.payload !== "string" || object.payload.length)
                        message.payload = $String(object.payload);
                return message;
            };

            /**
             * Creates a plain object from a ChemicalStructure message. Also converts values to other types if specified.
             * @function toObject
             * @memberof labflow.v1.ChemicalStructure
             * @static
             * @param {labflow.v1.ChemicalStructure} message ChemicalStructure
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ChemicalStructure.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.structureId = "";
                    object.format = "";
                    object.payload = "";
                }
                if (message.structureId != null && $Object.hasOwnProperty.call(message, "structureId"))
                    object.structureId = message.structureId;
                if (message.format != null && $Object.hasOwnProperty.call(message, "format"))
                    object.format = message.format;
                if (message.payload != null && $Object.hasOwnProperty.call(message, "payload"))
                    object.payload = message.payload;
                return object;
            };

            /**
             * Converts this ChemicalStructure to JSON.
             * @function toJSON
             * @memberof labflow.v1.ChemicalStructure
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ChemicalStructure.prototype.toJSON = function() {
                return ChemicalStructure.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for ChemicalStructure
             * @function getTypeUrl
             * @memberof labflow.v1.ChemicalStructure
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            ChemicalStructure.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/labflow.v1.ChemicalStructure";
            };

            return ChemicalStructure;
        })();

        v1.MarkdownAST = (function() {

            /**
             * Properties of a MarkdownAST.
             * @typedef {Object} labflow.v1.MarkdownAST.$Properties
             * @property {string|null} [documentId] MarkdownAST documentId
             * @property {string|null} [rootNode] MarkdownAST rootNode
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a MarkdownAST.
             * @memberof labflow.v1
             * @interface IMarkdownAST
             * @augments labflow.v1.MarkdownAST.$Properties
             * @deprecated Use labflow.v1.MarkdownAST.$Properties instead.
             */

            /**
             * Shape of a MarkdownAST.
             * @typedef {labflow.v1.MarkdownAST.$Properties} labflow.v1.MarkdownAST.$Shape
             */

            /**
             * Constructs a new MarkdownAST.
             * @memberof labflow.v1
             * @classdesc Represents a MarkdownAST.
             * @constructor
             * @param {labflow.v1.MarkdownAST.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const MarkdownAST = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * MarkdownAST documentId.
             * @member {string} documentId
             * @memberof labflow.v1.MarkdownAST
             * @instance
             */
            MarkdownAST.prototype.documentId = "";

            /**
             * MarkdownAST rootNode.
             * @member {string} rootNode
             * @memberof labflow.v1.MarkdownAST
             * @instance
             */
            MarkdownAST.prototype.rootNode = "";

            /**
             * Creates a new MarkdownAST instance using the specified properties.
             * @function create
             * @memberof labflow.v1.MarkdownAST
             * @static
             * @param {labflow.v1.MarkdownAST.$Properties=} [properties] Properties to set
             * @returns {labflow.v1.MarkdownAST} MarkdownAST instance
             * @type {{
             *   (properties: labflow.v1.MarkdownAST.$Shape): labflow.v1.MarkdownAST & labflow.v1.MarkdownAST.$Shape;
             *   (properties?: labflow.v1.MarkdownAST.$Properties): labflow.v1.MarkdownAST;
             * }}
             */
            MarkdownAST.create = function(properties) {
                return new MarkdownAST(properties);
            };

            /**
             * Encodes the specified MarkdownAST message. Does not implicitly {@link labflow.v1.MarkdownAST.verify|verify} messages.
             * @function encode
             * @memberof labflow.v1.MarkdownAST
             * @static
             * @param {labflow.v1.MarkdownAST.$Properties} message MarkdownAST message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MarkdownAST.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.documentId != null && $Object.hasOwnProperty.call(message, "documentId") && message.documentId !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.documentId);
                if (message.rootNode != null && $Object.hasOwnProperty.call(message, "rootNode") && message.rootNode !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.rootNode);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified MarkdownAST message, length delimited. Does not implicitly {@link labflow.v1.MarkdownAST.verify|verify} messages.
             * @function encodeDelimited
             * @memberof labflow.v1.MarkdownAST
             * @static
             * @param {labflow.v1.MarkdownAST.$Properties} message MarkdownAST message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MarkdownAST.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a MarkdownAST message from the specified reader or buffer.
             * @function decode
             * @memberof labflow.v1.MarkdownAST
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {labflow.v1.MarkdownAST & labflow.v1.MarkdownAST.$Shape} MarkdownAST
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            MarkdownAST.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message, value;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.labflow.v1.MarkdownAST();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.documentId = value;
                            else
                                delete message.documentId;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.rootNode = value;
                            else
                                delete message.rootNode;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a MarkdownAST message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof labflow.v1.MarkdownAST
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {labflow.v1.MarkdownAST & labflow.v1.MarkdownAST.$Shape} MarkdownAST
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            MarkdownAST.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a MarkdownAST message.
             * @function verify
             * @memberof labflow.v1.MarkdownAST
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            MarkdownAST.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.documentId != null && $Object.hasOwnProperty.call(message, "documentId"))
                    if (!$util.isString(message.documentId))
                        return "documentId: string expected";
                if (message.rootNode != null && $Object.hasOwnProperty.call(message, "rootNode"))
                    if (!$util.isString(message.rootNode))
                        return "rootNode: string expected";
                return null;
            };

            /**
             * Creates a MarkdownAST message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof labflow.v1.MarkdownAST
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {labflow.v1.MarkdownAST} MarkdownAST
             */
            MarkdownAST.fromObject = function (object, _depth) {
                if (object instanceof $root.labflow.v1.MarkdownAST)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".labflow.v1.MarkdownAST: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.labflow.v1.MarkdownAST();
                if (object.documentId != null)
                    if (typeof object.documentId !== "string" || object.documentId.length)
                        message.documentId = $String(object.documentId);
                if (object.rootNode != null)
                    if (typeof object.rootNode !== "string" || object.rootNode.length)
                        message.rootNode = $String(object.rootNode);
                return message;
            };

            /**
             * Creates a plain object from a MarkdownAST message. Also converts values to other types if specified.
             * @function toObject
             * @memberof labflow.v1.MarkdownAST
             * @static
             * @param {labflow.v1.MarkdownAST} message MarkdownAST
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            MarkdownAST.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.documentId = "";
                    object.rootNode = "";
                }
                if (message.documentId != null && $Object.hasOwnProperty.call(message, "documentId"))
                    object.documentId = message.documentId;
                if (message.rootNode != null && $Object.hasOwnProperty.call(message, "rootNode"))
                    object.rootNode = message.rootNode;
                return object;
            };

            /**
             * Converts this MarkdownAST to JSON.
             * @function toJSON
             * @memberof labflow.v1.MarkdownAST
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            MarkdownAST.prototype.toJSON = function() {
                return MarkdownAST.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for MarkdownAST
             * @function getTypeUrl
             * @memberof labflow.v1.MarkdownAST
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            MarkdownAST.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/labflow.v1.MarkdownAST";
            };

            return MarkdownAST;
        })();

        v1.DeltaMutation = (function() {

            /**
             * Properties of a DeltaMutation.
             * @typedef {Object} labflow.v1.DeltaMutation.$Properties
             * @property {string|null} [targetId] DeltaMutation targetId
             * @property {Uint8Array|null} [deltaData] DeltaMutation deltaData
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a DeltaMutation.
             * @memberof labflow.v1
             * @interface IDeltaMutation
             * @augments labflow.v1.DeltaMutation.$Properties
             * @deprecated Use labflow.v1.DeltaMutation.$Properties instead.
             */

            /**
             * Shape of a DeltaMutation.
             * @typedef {labflow.v1.DeltaMutation.$Properties} labflow.v1.DeltaMutation.$Shape
             */

            /**
             * Constructs a new DeltaMutation.
             * @memberof labflow.v1
             * @classdesc Represents a DeltaMutation.
             * @constructor
             * @param {labflow.v1.DeltaMutation.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const DeltaMutation = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * DeltaMutation targetId.
             * @member {string} targetId
             * @memberof labflow.v1.DeltaMutation
             * @instance
             */
            DeltaMutation.prototype.targetId = "";

            /**
             * DeltaMutation deltaData.
             * @member {Uint8Array} deltaData
             * @memberof labflow.v1.DeltaMutation
             * @instance
             */
            DeltaMutation.prototype.deltaData = $util.newBuffer([]);

            /**
             * Creates a new DeltaMutation instance using the specified properties.
             * @function create
             * @memberof labflow.v1.DeltaMutation
             * @static
             * @param {labflow.v1.DeltaMutation.$Properties=} [properties] Properties to set
             * @returns {labflow.v1.DeltaMutation} DeltaMutation instance
             * @type {{
             *   (properties: labflow.v1.DeltaMutation.$Shape): labflow.v1.DeltaMutation & labflow.v1.DeltaMutation.$Shape;
             *   (properties?: labflow.v1.DeltaMutation.$Properties): labflow.v1.DeltaMutation;
             * }}
             */
            DeltaMutation.create = function(properties) {
                return new DeltaMutation(properties);
            };

            /**
             * Encodes the specified DeltaMutation message. Does not implicitly {@link labflow.v1.DeltaMutation.verify|verify} messages.
             * @function encode
             * @memberof labflow.v1.DeltaMutation
             * @static
             * @param {labflow.v1.DeltaMutation.$Properties} message DeltaMutation message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeltaMutation.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.targetId != null && $Object.hasOwnProperty.call(message, "targetId") && message.targetId !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.targetId);
                if (message.deltaData != null && $Object.hasOwnProperty.call(message, "deltaData") && message.deltaData.length)
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.deltaData);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified DeltaMutation message, length delimited. Does not implicitly {@link labflow.v1.DeltaMutation.verify|verify} messages.
             * @function encodeDelimited
             * @memberof labflow.v1.DeltaMutation
             * @static
             * @param {labflow.v1.DeltaMutation.$Properties} message DeltaMutation message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeltaMutation.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a DeltaMutation message from the specified reader or buffer.
             * @function decode
             * @memberof labflow.v1.DeltaMutation
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {labflow.v1.DeltaMutation & labflow.v1.DeltaMutation.$Shape} DeltaMutation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeltaMutation.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message, value;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.labflow.v1.DeltaMutation();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.targetId = value;
                            else
                                delete message.targetId;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.bytes()).length)
                                message.deltaData = value;
                            else
                                delete message.deltaData;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a DeltaMutation message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof labflow.v1.DeltaMutation
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {labflow.v1.DeltaMutation & labflow.v1.DeltaMutation.$Shape} DeltaMutation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeltaMutation.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DeltaMutation message.
             * @function verify
             * @memberof labflow.v1.DeltaMutation
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DeltaMutation.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.targetId != null && $Object.hasOwnProperty.call(message, "targetId"))
                    if (!$util.isString(message.targetId))
                        return "targetId: string expected";
                if (message.deltaData != null && $Object.hasOwnProperty.call(message, "deltaData"))
                    if (!(message.deltaData && typeof message.deltaData.length === "number" || $util.isString(message.deltaData)))
                        return "deltaData: buffer expected";
                return null;
            };

            /**
             * Creates a DeltaMutation message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof labflow.v1.DeltaMutation
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {labflow.v1.DeltaMutation} DeltaMutation
             */
            DeltaMutation.fromObject = function (object, _depth) {
                if (object instanceof $root.labflow.v1.DeltaMutation)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".labflow.v1.DeltaMutation: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.labflow.v1.DeltaMutation();
                if (object.targetId != null)
                    if (typeof object.targetId !== "string" || object.targetId.length)
                        message.targetId = $String(object.targetId);
                if (object.deltaData != null)
                    if (object.deltaData.length)
                        if (typeof object.deltaData === "string")
                            $util.base64.decode(object.deltaData, message.deltaData = $util.newBuffer($util.base64.length(object.deltaData)), 0);
                        else if (object.deltaData.length >= 0)
                            message.deltaData = object.deltaData;
                return message;
            };

            /**
             * Creates a plain object from a DeltaMutation message. Also converts values to other types if specified.
             * @function toObject
             * @memberof labflow.v1.DeltaMutation
             * @static
             * @param {labflow.v1.DeltaMutation} message DeltaMutation
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DeltaMutation.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.targetId = "";
                    if (options.bytes === $String)
                        object.deltaData = "";
                    else {
                        object.deltaData = [];
                        if (options.bytes !== $Array)
                            object.deltaData = $util.newBuffer(object.deltaData);
                    }
                }
                if (message.targetId != null && $Object.hasOwnProperty.call(message, "targetId"))
                    object.targetId = message.targetId;
                if (message.deltaData != null && $Object.hasOwnProperty.call(message, "deltaData"))
                    object.deltaData = options.bytes === $String ? $util.base64.encode(message.deltaData, 0, message.deltaData.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.deltaData) : message.deltaData;
                return object;
            };

            /**
             * Converts this DeltaMutation to JSON.
             * @function toJSON
             * @memberof labflow.v1.DeltaMutation
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DeltaMutation.prototype.toJSON = function() {
                return DeltaMutation.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for DeltaMutation
             * @function getTypeUrl
             * @memberof labflow.v1.DeltaMutation
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            DeltaMutation.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/labflow.v1.DeltaMutation";
            };

            return DeltaMutation;
        })();

        v1.AgentEventRequest = (function() {

            /**
             * Properties of an AgentEventRequest.
             * @typedef {Object} labflow.v1.AgentEventRequest.$Properties
             * @property {string|null} [sessionId] AgentEventRequest sessionId
             * @property {string|null} [eventType] AgentEventRequest eventType
             * @property {Uint8Array|null} [payload] AgentEventRequest payload
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of an AgentEventRequest.
             * @memberof labflow.v1
             * @interface IAgentEventRequest
             * @augments labflow.v1.AgentEventRequest.$Properties
             * @deprecated Use labflow.v1.AgentEventRequest.$Properties instead.
             */

            /**
             * Shape of an AgentEventRequest.
             * @typedef {labflow.v1.AgentEventRequest.$Properties} labflow.v1.AgentEventRequest.$Shape
             */

            /**
             * Constructs a new AgentEventRequest.
             * @memberof labflow.v1
             * @classdesc Represents an AgentEventRequest.
             * @constructor
             * @param {labflow.v1.AgentEventRequest.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const AgentEventRequest = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * AgentEventRequest sessionId.
             * @member {string} sessionId
             * @memberof labflow.v1.AgentEventRequest
             * @instance
             */
            AgentEventRequest.prototype.sessionId = "";

            /**
             * AgentEventRequest eventType.
             * @member {string} eventType
             * @memberof labflow.v1.AgentEventRequest
             * @instance
             */
            AgentEventRequest.prototype.eventType = "";

            /**
             * AgentEventRequest payload.
             * @member {Uint8Array} payload
             * @memberof labflow.v1.AgentEventRequest
             * @instance
             */
            AgentEventRequest.prototype.payload = $util.newBuffer([]);

            /**
             * Creates a new AgentEventRequest instance using the specified properties.
             * @function create
             * @memberof labflow.v1.AgentEventRequest
             * @static
             * @param {labflow.v1.AgentEventRequest.$Properties=} [properties] Properties to set
             * @returns {labflow.v1.AgentEventRequest} AgentEventRequest instance
             * @type {{
             *   (properties: labflow.v1.AgentEventRequest.$Shape): labflow.v1.AgentEventRequest & labflow.v1.AgentEventRequest.$Shape;
             *   (properties?: labflow.v1.AgentEventRequest.$Properties): labflow.v1.AgentEventRequest;
             * }}
             */
            AgentEventRequest.create = function(properties) {
                return new AgentEventRequest(properties);
            };

            /**
             * Encodes the specified AgentEventRequest message. Does not implicitly {@link labflow.v1.AgentEventRequest.verify|verify} messages.
             * @function encode
             * @memberof labflow.v1.AgentEventRequest
             * @static
             * @param {labflow.v1.AgentEventRequest.$Properties} message AgentEventRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AgentEventRequest.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId") && message.sessionId !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.sessionId);
                if (message.eventType != null && $Object.hasOwnProperty.call(message, "eventType") && message.eventType !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.eventType);
                if (message.payload != null && $Object.hasOwnProperty.call(message, "payload") && message.payload.length)
                    writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.payload);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified AgentEventRequest message, length delimited. Does not implicitly {@link labflow.v1.AgentEventRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof labflow.v1.AgentEventRequest
             * @static
             * @param {labflow.v1.AgentEventRequest.$Properties} message AgentEventRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AgentEventRequest.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes an AgentEventRequest message from the specified reader or buffer.
             * @function decode
             * @memberof labflow.v1.AgentEventRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {labflow.v1.AgentEventRequest & labflow.v1.AgentEventRequest.$Shape} AgentEventRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AgentEventRequest.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message, value;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.labflow.v1.AgentEventRequest();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.sessionId = value;
                            else
                                delete message.sessionId;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.eventType = value;
                            else
                                delete message.eventType;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.bytes()).length)
                                message.payload = value;
                            else
                                delete message.payload;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes an AgentEventRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof labflow.v1.AgentEventRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {labflow.v1.AgentEventRequest & labflow.v1.AgentEventRequest.$Shape} AgentEventRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AgentEventRequest.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an AgentEventRequest message.
             * @function verify
             * @memberof labflow.v1.AgentEventRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            AgentEventRequest.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
                    if (!$util.isString(message.sessionId))
                        return "sessionId: string expected";
                if (message.eventType != null && $Object.hasOwnProperty.call(message, "eventType"))
                    if (!$util.isString(message.eventType))
                        return "eventType: string expected";
                if (message.payload != null && $Object.hasOwnProperty.call(message, "payload"))
                    if (!(message.payload && typeof message.payload.length === "number" || $util.isString(message.payload)))
                        return "payload: buffer expected";
                return null;
            };

            /**
             * Creates an AgentEventRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof labflow.v1.AgentEventRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {labflow.v1.AgentEventRequest} AgentEventRequest
             */
            AgentEventRequest.fromObject = function (object, _depth) {
                if (object instanceof $root.labflow.v1.AgentEventRequest)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".labflow.v1.AgentEventRequest: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.labflow.v1.AgentEventRequest();
                if (object.sessionId != null)
                    if (typeof object.sessionId !== "string" || object.sessionId.length)
                        message.sessionId = $String(object.sessionId);
                if (object.eventType != null)
                    if (typeof object.eventType !== "string" || object.eventType.length)
                        message.eventType = $String(object.eventType);
                if (object.payload != null)
                    if (object.payload.length)
                        if (typeof object.payload === "string")
                            $util.base64.decode(object.payload, message.payload = $util.newBuffer($util.base64.length(object.payload)), 0);
                        else if (object.payload.length >= 0)
                            message.payload = object.payload;
                return message;
            };

            /**
             * Creates a plain object from an AgentEventRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof labflow.v1.AgentEventRequest
             * @static
             * @param {labflow.v1.AgentEventRequest} message AgentEventRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            AgentEventRequest.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.sessionId = "";
                    object.eventType = "";
                    if (options.bytes === $String)
                        object.payload = "";
                    else {
                        object.payload = [];
                        if (options.bytes !== $Array)
                            object.payload = $util.newBuffer(object.payload);
                    }
                }
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
                    object.sessionId = message.sessionId;
                if (message.eventType != null && $Object.hasOwnProperty.call(message, "eventType"))
                    object.eventType = message.eventType;
                if (message.payload != null && $Object.hasOwnProperty.call(message, "payload"))
                    object.payload = options.bytes === $String ? $util.base64.encode(message.payload, 0, message.payload.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.payload) : message.payload;
                return object;
            };

            /**
             * Converts this AgentEventRequest to JSON.
             * @function toJSON
             * @memberof labflow.v1.AgentEventRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            AgentEventRequest.prototype.toJSON = function() {
                return AgentEventRequest.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for AgentEventRequest
             * @function getTypeUrl
             * @memberof labflow.v1.AgentEventRequest
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            AgentEventRequest.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/labflow.v1.AgentEventRequest";
            };

            return AgentEventRequest;
        })();

        v1.AgentEventResponse = (function() {

            /**
             * Properties of an AgentEventResponse.
             * @typedef {Object} labflow.v1.AgentEventResponse.$Properties
             * @property {string|null} [sessionId] AgentEventResponse sessionId
             * @property {string|null} [responseType] AgentEventResponse responseType
             * @property {Uint8Array|null} [payload] AgentEventResponse payload
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of an AgentEventResponse.
             * @memberof labflow.v1
             * @interface IAgentEventResponse
             * @augments labflow.v1.AgentEventResponse.$Properties
             * @deprecated Use labflow.v1.AgentEventResponse.$Properties instead.
             */

            /**
             * Shape of an AgentEventResponse.
             * @typedef {labflow.v1.AgentEventResponse.$Properties} labflow.v1.AgentEventResponse.$Shape
             */

            /**
             * Constructs a new AgentEventResponse.
             * @memberof labflow.v1
             * @classdesc Represents an AgentEventResponse.
             * @constructor
             * @param {labflow.v1.AgentEventResponse.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const AgentEventResponse = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * AgentEventResponse sessionId.
             * @member {string} sessionId
             * @memberof labflow.v1.AgentEventResponse
             * @instance
             */
            AgentEventResponse.prototype.sessionId = "";

            /**
             * AgentEventResponse responseType.
             * @member {string} responseType
             * @memberof labflow.v1.AgentEventResponse
             * @instance
             */
            AgentEventResponse.prototype.responseType = "";

            /**
             * AgentEventResponse payload.
             * @member {Uint8Array} payload
             * @memberof labflow.v1.AgentEventResponse
             * @instance
             */
            AgentEventResponse.prototype.payload = $util.newBuffer([]);

            /**
             * Creates a new AgentEventResponse instance using the specified properties.
             * @function create
             * @memberof labflow.v1.AgentEventResponse
             * @static
             * @param {labflow.v1.AgentEventResponse.$Properties=} [properties] Properties to set
             * @returns {labflow.v1.AgentEventResponse} AgentEventResponse instance
             * @type {{
             *   (properties: labflow.v1.AgentEventResponse.$Shape): labflow.v1.AgentEventResponse & labflow.v1.AgentEventResponse.$Shape;
             *   (properties?: labflow.v1.AgentEventResponse.$Properties): labflow.v1.AgentEventResponse;
             * }}
             */
            AgentEventResponse.create = function(properties) {
                return new AgentEventResponse(properties);
            };

            /**
             * Encodes the specified AgentEventResponse message. Does not implicitly {@link labflow.v1.AgentEventResponse.verify|verify} messages.
             * @function encode
             * @memberof labflow.v1.AgentEventResponse
             * @static
             * @param {labflow.v1.AgentEventResponse.$Properties} message AgentEventResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AgentEventResponse.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId") && message.sessionId !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.sessionId);
                if (message.responseType != null && $Object.hasOwnProperty.call(message, "responseType") && message.responseType !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.responseType);
                if (message.payload != null && $Object.hasOwnProperty.call(message, "payload") && message.payload.length)
                    writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.payload);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified AgentEventResponse message, length delimited. Does not implicitly {@link labflow.v1.AgentEventResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof labflow.v1.AgentEventResponse
             * @static
             * @param {labflow.v1.AgentEventResponse.$Properties} message AgentEventResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AgentEventResponse.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes an AgentEventResponse message from the specified reader or buffer.
             * @function decode
             * @memberof labflow.v1.AgentEventResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {labflow.v1.AgentEventResponse & labflow.v1.AgentEventResponse.$Shape} AgentEventResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AgentEventResponse.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message, value;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.labflow.v1.AgentEventResponse();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.sessionId = value;
                            else
                                delete message.sessionId;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.responseType = value;
                            else
                                delete message.responseType;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.bytes()).length)
                                message.payload = value;
                            else
                                delete message.payload;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes an AgentEventResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof labflow.v1.AgentEventResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {labflow.v1.AgentEventResponse & labflow.v1.AgentEventResponse.$Shape} AgentEventResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AgentEventResponse.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an AgentEventResponse message.
             * @function verify
             * @memberof labflow.v1.AgentEventResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            AgentEventResponse.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
                    if (!$util.isString(message.sessionId))
                        return "sessionId: string expected";
                if (message.responseType != null && $Object.hasOwnProperty.call(message, "responseType"))
                    if (!$util.isString(message.responseType))
                        return "responseType: string expected";
                if (message.payload != null && $Object.hasOwnProperty.call(message, "payload"))
                    if (!(message.payload && typeof message.payload.length === "number" || $util.isString(message.payload)))
                        return "payload: buffer expected";
                return null;
            };

            /**
             * Creates an AgentEventResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof labflow.v1.AgentEventResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {labflow.v1.AgentEventResponse} AgentEventResponse
             */
            AgentEventResponse.fromObject = function (object, _depth) {
                if (object instanceof $root.labflow.v1.AgentEventResponse)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".labflow.v1.AgentEventResponse: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.labflow.v1.AgentEventResponse();
                if (object.sessionId != null)
                    if (typeof object.sessionId !== "string" || object.sessionId.length)
                        message.sessionId = $String(object.sessionId);
                if (object.responseType != null)
                    if (typeof object.responseType !== "string" || object.responseType.length)
                        message.responseType = $String(object.responseType);
                if (object.payload != null)
                    if (object.payload.length)
                        if (typeof object.payload === "string")
                            $util.base64.decode(object.payload, message.payload = $util.newBuffer($util.base64.length(object.payload)), 0);
                        else if (object.payload.length >= 0)
                            message.payload = object.payload;
                return message;
            };

            /**
             * Creates a plain object from an AgentEventResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof labflow.v1.AgentEventResponse
             * @static
             * @param {labflow.v1.AgentEventResponse} message AgentEventResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            AgentEventResponse.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.sessionId = "";
                    object.responseType = "";
                    if (options.bytes === $String)
                        object.payload = "";
                    else {
                        object.payload = [];
                        if (options.bytes !== $Array)
                            object.payload = $util.newBuffer(object.payload);
                    }
                }
                if (message.sessionId != null && $Object.hasOwnProperty.call(message, "sessionId"))
                    object.sessionId = message.sessionId;
                if (message.responseType != null && $Object.hasOwnProperty.call(message, "responseType"))
                    object.responseType = message.responseType;
                if (message.payload != null && $Object.hasOwnProperty.call(message, "payload"))
                    object.payload = options.bytes === $String ? $util.base64.encode(message.payload, 0, message.payload.length) : options.bytes === $Array ? $Array.prototype.slice.call(message.payload) : message.payload;
                return object;
            };

            /**
             * Converts this AgentEventResponse to JSON.
             * @function toJSON
             * @memberof labflow.v1.AgentEventResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            AgentEventResponse.prototype.toJSON = function() {
                return AgentEventResponse.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for AgentEventResponse
             * @function getTypeUrl
             * @memberof labflow.v1.AgentEventResponse
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            AgentEventResponse.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/labflow.v1.AgentEventResponse";
            };

            return AgentEventResponse;
        })();

        v1.CrdtOperation = (function() {

            /**
             * Properties of a CrdtOperation.
             * @typedef {Object} labflow.v1.CrdtOperation.$Properties
             * @property {labflow.v1.CrdtOperation.OpType|null} [opType] CrdtOperation opType
             * @property {string|null} [id] CrdtOperation id
             * @property {string|null} [parentId] CrdtOperation parentId
             * @property {number|null} [index] CrdtOperation index
             * @property {string|null} [value] CrdtOperation value
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a CrdtOperation.
             * @memberof labflow.v1
             * @interface ICrdtOperation
             * @augments labflow.v1.CrdtOperation.$Properties
             * @deprecated Use labflow.v1.CrdtOperation.$Properties instead.
             */

            /**
             * Shape of a CrdtOperation.
             * @typedef {labflow.v1.CrdtOperation.$Properties} labflow.v1.CrdtOperation.$Shape
             */

            /**
             * Constructs a new CrdtOperation.
             * @memberof labflow.v1
             * @classdesc Represents a CrdtOperation.
             * @constructor
             * @param {labflow.v1.CrdtOperation.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const CrdtOperation = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * CrdtOperation opType.
             * @member {labflow.v1.CrdtOperation.OpType} opType
             * @memberof labflow.v1.CrdtOperation
             * @instance
             */
            CrdtOperation.prototype.opType = 0;

            /**
             * CrdtOperation id.
             * @member {string} id
             * @memberof labflow.v1.CrdtOperation
             * @instance
             */
            CrdtOperation.prototype.id = "";

            /**
             * CrdtOperation parentId.
             * @member {string} parentId
             * @memberof labflow.v1.CrdtOperation
             * @instance
             */
            CrdtOperation.prototype.parentId = "";

            /**
             * CrdtOperation index.
             * @member {number} index
             * @memberof labflow.v1.CrdtOperation
             * @instance
             */
            CrdtOperation.prototype.index = 0;

            /**
             * CrdtOperation value.
             * @member {string} value
             * @memberof labflow.v1.CrdtOperation
             * @instance
             */
            CrdtOperation.prototype.value = "";

            /**
             * Creates a new CrdtOperation instance using the specified properties.
             * @function create
             * @memberof labflow.v1.CrdtOperation
             * @static
             * @param {labflow.v1.CrdtOperation.$Properties=} [properties] Properties to set
             * @returns {labflow.v1.CrdtOperation} CrdtOperation instance
             * @type {{
             *   (properties: labflow.v1.CrdtOperation.$Shape): labflow.v1.CrdtOperation & labflow.v1.CrdtOperation.$Shape;
             *   (properties?: labflow.v1.CrdtOperation.$Properties): labflow.v1.CrdtOperation;
             * }}
             */
            CrdtOperation.create = function(properties) {
                return new CrdtOperation(properties);
            };

            /**
             * Encodes the specified CrdtOperation message. Does not implicitly {@link labflow.v1.CrdtOperation.verify|verify} messages.
             * @function encode
             * @memberof labflow.v1.CrdtOperation
             * @static
             * @param {labflow.v1.CrdtOperation.$Properties} message CrdtOperation message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CrdtOperation.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.opType != null && $Object.hasOwnProperty.call(message, "opType") && message.opType !== 0)
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.opType);
                if (message.id != null && $Object.hasOwnProperty.call(message, "id") && message.id !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.id);
                if (message.parentId != null && $Object.hasOwnProperty.call(message, "parentId") && message.parentId !== "")
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.parentId);
                if (message.index != null && $Object.hasOwnProperty.call(message, "index") && message.index !== 0)
                    writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.index);
                if (message.value != null && $Object.hasOwnProperty.call(message, "value") && message.value !== "")
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.value);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified CrdtOperation message, length delimited. Does not implicitly {@link labflow.v1.CrdtOperation.verify|verify} messages.
             * @function encodeDelimited
             * @memberof labflow.v1.CrdtOperation
             * @static
             * @param {labflow.v1.CrdtOperation.$Properties} message CrdtOperation message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CrdtOperation.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a CrdtOperation message from the specified reader or buffer.
             * @function decode
             * @memberof labflow.v1.CrdtOperation
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {labflow.v1.CrdtOperation & labflow.v1.CrdtOperation.$Shape} CrdtOperation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CrdtOperation.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message, value;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.labflow.v1.CrdtOperation();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 0)
                                break;
                            if (value = reader.int32())
                                message.opType = value;
                            else
                                delete message.opType;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.id = value;
                            else
                                delete message.id;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.parentId = value;
                            else
                                delete message.parentId;
                            continue;
                        }
                    case 4: {
                            if (wireType !== 0)
                                break;
                            if (value = reader.uint32())
                                message.index = value;
                            else
                                delete message.index;
                            continue;
                        }
                    case 5: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.value = value;
                            else
                                delete message.value;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a CrdtOperation message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof labflow.v1.CrdtOperation
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {labflow.v1.CrdtOperation & labflow.v1.CrdtOperation.$Shape} CrdtOperation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CrdtOperation.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a CrdtOperation message.
             * @function verify
             * @memberof labflow.v1.CrdtOperation
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CrdtOperation.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.opType != null && $Object.hasOwnProperty.call(message, "opType"))
                    if (typeof message.opType !== "number" || (message.opType | 0) !== message.opType)
                        return "opType: enum value expected";
                if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                if (message.parentId != null && $Object.hasOwnProperty.call(message, "parentId"))
                    if (!$util.isString(message.parentId))
                        return "parentId: string expected";
                if (message.index != null && $Object.hasOwnProperty.call(message, "index"))
                    if (!$util.isInteger(message.index))
                        return "index: integer expected";
                if (message.value != null && $Object.hasOwnProperty.call(message, "value"))
                    if (!$util.isString(message.value))
                        return "value: string expected";
                return null;
            };

            /**
             * Creates a CrdtOperation message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof labflow.v1.CrdtOperation
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {labflow.v1.CrdtOperation} CrdtOperation
             */
            CrdtOperation.fromObject = function (object, _depth) {
                if (object instanceof $root.labflow.v1.CrdtOperation)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".labflow.v1.CrdtOperation: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.labflow.v1.CrdtOperation();
                if (object.opType !== 0 && (typeof object.opType !== "string" || $root.labflow.v1.CrdtOperation.OpType[object.opType] !== 0))
                    switch (object.opType) {
                    case "INSERT":
                    case 0:
                        message.opType = 0;
                        break;
                    case "DELETE":
                    case 1:
                        message.opType = 1;
                        break;
                    case "UPDATE":
                    case 2:
                        message.opType = 2;
                        break;
                    default:
                        if (typeof object.opType === "number" && (object.opType | 0) === object.opType)
                            message.opType = object.opType;
                    }
                if (object.id != null)
                    if (typeof object.id !== "string" || object.id.length)
                        message.id = $String(object.id);
                if (object.parentId != null)
                    if (typeof object.parentId !== "string" || object.parentId.length)
                        message.parentId = $String(object.parentId);
                if (object.index != null)
                    if ($Number(object.index) !== 0)
                        message.index = object.index >>> 0;
                if (object.value != null)
                    if (typeof object.value !== "string" || object.value.length)
                        message.value = $String(object.value);
                return message;
            };

            /**
             * Creates a plain object from a CrdtOperation message. Also converts values to other types if specified.
             * @function toObject
             * @memberof labflow.v1.CrdtOperation
             * @static
             * @param {labflow.v1.CrdtOperation} message CrdtOperation
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CrdtOperation.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.defaults) {
                    object.opType = options.enums === $String ? "INSERT" : 0;
                    object.id = "";
                    object.parentId = "";
                    object.index = 0;
                    object.value = "";
                }
                if (message.opType != null && $Object.hasOwnProperty.call(message, "opType"))
                    object.opType = options.enums === $String ? $root.labflow.v1.CrdtOperation.OpType[message.opType] === $undefined ? message.opType : $root.labflow.v1.CrdtOperation.OpType[message.opType] : message.opType;
                if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                    object.id = message.id;
                if (message.parentId != null && $Object.hasOwnProperty.call(message, "parentId"))
                    object.parentId = message.parentId;
                if (message.index != null && $Object.hasOwnProperty.call(message, "index"))
                    object.index = message.index;
                if (message.value != null && $Object.hasOwnProperty.call(message, "value"))
                    object.value = message.value;
                return object;
            };

            /**
             * Converts this CrdtOperation to JSON.
             * @function toJSON
             * @memberof labflow.v1.CrdtOperation
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CrdtOperation.prototype.toJSON = function() {
                return CrdtOperation.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for CrdtOperation
             * @function getTypeUrl
             * @memberof labflow.v1.CrdtOperation
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            CrdtOperation.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/labflow.v1.CrdtOperation";
            };

            /**
             * OpType enum.
             * @name labflow.v1.CrdtOperation.OpType
             * @enum {number}
             * @property {number} INSERT=0 INSERT value
             * @property {number} DELETE=1 DELETE value
             * @property {number} UPDATE=2 UPDATE value
             */
            CrdtOperation.OpType = (function() {
                const valuesById = $Object.create(null), values = $Object.create(valuesById);
                values[valuesById[0] = "INSERT"] = 0;
                values[valuesById[1] = "DELETE"] = 1;
                values[valuesById[2] = "UPDATE"] = 2;
                return values;
            })();

            return CrdtOperation;
        })();

        v1.CrdtDeltaChunk = (function() {

            /**
             * Properties of a CrdtDeltaChunk.
             * @typedef {Object} labflow.v1.CrdtDeltaChunk.$Properties
             * @property {string|null} [documentId] CrdtDeltaChunk documentId
             * @property {Array.<labflow.v1.CrdtOperation.$Properties>|null} [operations] CrdtDeltaChunk operations
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a CrdtDeltaChunk.
             * @memberof labflow.v1
             * @interface ICrdtDeltaChunk
             * @augments labflow.v1.CrdtDeltaChunk.$Properties
             * @deprecated Use labflow.v1.CrdtDeltaChunk.$Properties instead.
             */

            /**
             * Shape of a CrdtDeltaChunk.
             * @typedef {labflow.v1.CrdtDeltaChunk.$Properties} labflow.v1.CrdtDeltaChunk.$Shape
             */

            /**
             * Constructs a new CrdtDeltaChunk.
             * @memberof labflow.v1
             * @classdesc Represents a CrdtDeltaChunk.
             * @constructor
             * @param {labflow.v1.CrdtDeltaChunk.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const CrdtDeltaChunk = function (properties) {
                this.operations = [];
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * CrdtDeltaChunk documentId.
             * @member {string} documentId
             * @memberof labflow.v1.CrdtDeltaChunk
             * @instance
             */
            CrdtDeltaChunk.prototype.documentId = "";

            /**
             * CrdtDeltaChunk operations.
             * @member {Array.<labflow.v1.CrdtOperation.$Properties>} operations
             * @memberof labflow.v1.CrdtDeltaChunk
             * @instance
             */
            CrdtDeltaChunk.prototype.operations = $util.emptyArray;

            /**
             * Creates a new CrdtDeltaChunk instance using the specified properties.
             * @function create
             * @memberof labflow.v1.CrdtDeltaChunk
             * @static
             * @param {labflow.v1.CrdtDeltaChunk.$Properties=} [properties] Properties to set
             * @returns {labflow.v1.CrdtDeltaChunk} CrdtDeltaChunk instance
             * @type {{
             *   (properties: labflow.v1.CrdtDeltaChunk.$Shape): labflow.v1.CrdtDeltaChunk & labflow.v1.CrdtDeltaChunk.$Shape;
             *   (properties?: labflow.v1.CrdtDeltaChunk.$Properties): labflow.v1.CrdtDeltaChunk;
             * }}
             */
            CrdtDeltaChunk.create = function(properties) {
                return new CrdtDeltaChunk(properties);
            };

            /**
             * Encodes the specified CrdtDeltaChunk message. Does not implicitly {@link labflow.v1.CrdtDeltaChunk.verify|verify} messages.
             * @function encode
             * @memberof labflow.v1.CrdtDeltaChunk
             * @static
             * @param {labflow.v1.CrdtDeltaChunk.$Properties} message CrdtDeltaChunk message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CrdtDeltaChunk.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.documentId != null && $Object.hasOwnProperty.call(message, "documentId") && message.documentId !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.documentId);
                if (message.operations != null && message.operations.length)
                    for (let i = 0; i < message.operations.length; ++i)
                        $root.labflow.v1.CrdtOperation.encode(message.operations[i], writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Encodes the specified CrdtDeltaChunk message, length delimited. Does not implicitly {@link labflow.v1.CrdtDeltaChunk.verify|verify} messages.
             * @function encodeDelimited
             * @memberof labflow.v1.CrdtDeltaChunk
             * @static
             * @param {labflow.v1.CrdtDeltaChunk.$Properties} message CrdtDeltaChunk message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CrdtDeltaChunk.encodeDelimited = function(message, writer) {
                return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
            };

            /**
             * Decodes a CrdtDeltaChunk message from the specified reader or buffer.
             * @function decode
             * @memberof labflow.v1.CrdtDeltaChunk
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {labflow.v1.CrdtDeltaChunk & labflow.v1.CrdtDeltaChunk.$Shape} CrdtDeltaChunk
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CrdtDeltaChunk.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end, message, value;
                if (length === $undefined)
                    end = reader.len;
                else {
                    end = reader.pos + length;
                    if (end > reader.len)
                        throw $RangeError("index out of range");
                    length = reader.len;
                    reader.len = end;
                }
                message = _target || new $root.labflow.v1.CrdtDeltaChunk();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.documentId = value;
                            else
                                delete message.documentId;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if (!(message.operations && message.operations.length))
                                message.operations = [];
                            message.operations.push($root.labflow.v1.CrdtOperation.decode(reader, reader.uint32(), $undefined, _depth + 1));
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (length !== $undefined) {
                    if (reader.pos !== end)
                        throw $RangeError("index out of range");
                    reader.len = length;
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Decodes a CrdtDeltaChunk message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof labflow.v1.CrdtDeltaChunk
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {labflow.v1.CrdtDeltaChunk & labflow.v1.CrdtDeltaChunk.$Shape} CrdtDeltaChunk
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CrdtDeltaChunk.decodeDelimited = function(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a CrdtDeltaChunk message.
             * @function verify
             * @memberof labflow.v1.CrdtDeltaChunk
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CrdtDeltaChunk.verify = function (message, _depth) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    return "max depth exceeded";
                if (message.documentId != null && $Object.hasOwnProperty.call(message, "documentId"))
                    if (!$util.isString(message.documentId))
                        return "documentId: string expected";
                if (message.operations != null && $Object.hasOwnProperty.call(message, "operations")) {
                    if (!$Array.isArray(message.operations))
                        return "operations: array expected";
                    for (let i = 0; i < message.operations.length; ++i) {
                        let error = $root.labflow.v1.CrdtOperation.verify(message.operations[i], _depth + 1);
                        if (error)
                            return "operations." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a CrdtDeltaChunk message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof labflow.v1.CrdtDeltaChunk
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {labflow.v1.CrdtDeltaChunk} CrdtDeltaChunk
             */
            CrdtDeltaChunk.fromObject = function (object, _depth) {
                if (object instanceof $root.labflow.v1.CrdtDeltaChunk)
                    return object;
                if (!$util.isObject(object))
                    throw $TypeError(".labflow.v1.CrdtDeltaChunk: object expected");
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let message = new $root.labflow.v1.CrdtDeltaChunk();
                if (object.documentId != null)
                    if (typeof object.documentId !== "string" || object.documentId.length)
                        message.documentId = $String(object.documentId);
                if (object.operations) {
                    if (!$Array.isArray(object.operations))
                        throw $TypeError(".labflow.v1.CrdtDeltaChunk.operations: array expected");
                    message.operations = $Array(object.operations.length);
                    for (let i = 0; i < object.operations.length; ++i) {
                        if (!$util.isObject(object.operations[i]))
                            throw $TypeError(".labflow.v1.CrdtDeltaChunk.operations: object expected");
                        message.operations[i] = $root.labflow.v1.CrdtOperation.fromObject(object.operations[i], _depth + 1);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a CrdtDeltaChunk message. Also converts values to other types if specified.
             * @function toObject
             * @memberof labflow.v1.CrdtDeltaChunk
             * @static
             * @param {labflow.v1.CrdtDeltaChunk} message CrdtDeltaChunk
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CrdtDeltaChunk.toObject = function (message, options, _depth) {
                if (!options)
                    options = {};
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                let object = {};
                if (options.arrays || options.defaults)
                    object.operations = [];
                if (options.defaults)
                    object.documentId = "";
                if (message.documentId != null && $Object.hasOwnProperty.call(message, "documentId"))
                    object.documentId = message.documentId;
                if (message.operations && message.operations.length) {
                    object.operations = $Array(message.operations.length);
                    for (let j = 0; j < message.operations.length; ++j)
                        object.operations[j] = $root.labflow.v1.CrdtOperation.toObject(message.operations[j], options, _depth + 1);
                }
                return object;
            };

            /**
             * Converts this CrdtDeltaChunk to JSON.
             * @function toJSON
             * @memberof labflow.v1.CrdtDeltaChunk
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CrdtDeltaChunk.prototype.toJSON = function() {
                return CrdtDeltaChunk.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the type url for CrdtDeltaChunk
             * @function getTypeUrl
             * @memberof labflow.v1.CrdtDeltaChunk
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            CrdtDeltaChunk.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/labflow.v1.CrdtDeltaChunk";
            };

            return CrdtDeltaChunk;
        })();

        return v1;
    })();

    return labflow;
})();

export {
  $root as default
};
