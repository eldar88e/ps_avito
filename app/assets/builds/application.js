(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/@rails/actioncable/src/adapters.js
  var adapters_default;
  var init_adapters = __esm({
    "node_modules/@rails/actioncable/src/adapters.js"() {
      adapters_default = {
        logger: typeof console !== "undefined" ? console : void 0,
        WebSocket: typeof WebSocket !== "undefined" ? WebSocket : void 0
      };
    }
  });

  // node_modules/@rails/actioncable/src/logger.js
  var logger_default;
  var init_logger = __esm({
    "node_modules/@rails/actioncable/src/logger.js"() {
      init_adapters();
      logger_default = {
        log(...messages) {
          if (this.enabled) {
            messages.push(Date.now());
            adapters_default.logger.log("[ActionCable]", ...messages);
          }
        }
      };
    }
  });

  // node_modules/@rails/actioncable/src/connection_monitor.js
  var now, secondsSince, ConnectionMonitor, connection_monitor_default;
  var init_connection_monitor = __esm({
    "node_modules/@rails/actioncable/src/connection_monitor.js"() {
      init_logger();
      now = () => (/* @__PURE__ */ new Date()).getTime();
      secondsSince = (time) => (now() - time) / 1e3;
      ConnectionMonitor = class {
        constructor(connection) {
          this.visibilityDidChange = this.visibilityDidChange.bind(this);
          this.connection = connection;
          this.reconnectAttempts = 0;
        }
        start() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            addEventListener("visibilitychange", this.visibilityDidChange);
            logger_default.log(`ConnectionMonitor started. stale threshold = ${this.constructor.staleThreshold} s`);
          }
        }
        stop() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            removeEventListener("visibilitychange", this.visibilityDidChange);
            logger_default.log("ConnectionMonitor stopped");
          }
        }
        isRunning() {
          return this.startedAt && !this.stoppedAt;
        }
        recordPing() {
          this.pingedAt = now();
        }
        recordConnect() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          logger_default.log("ConnectionMonitor recorded connect");
        }
        recordDisconnect() {
          this.disconnectedAt = now();
          logger_default.log("ConnectionMonitor recorded disconnect");
        }
        // Private
        startPolling() {
          this.stopPolling();
          this.poll();
        }
        stopPolling() {
          clearTimeout(this.pollTimeout);
        }
        poll() {
          this.pollTimeout = setTimeout(
            () => {
              this.reconnectIfStale();
              this.poll();
            },
            this.getPollInterval()
          );
        }
        getPollInterval() {
          const { staleThreshold, reconnectionBackoffRate } = this.constructor;
          const backoff = Math.pow(1 + reconnectionBackoffRate, Math.min(this.reconnectAttempts, 10));
          const jitterMax = this.reconnectAttempts === 0 ? 1 : reconnectionBackoffRate;
          const jitter = jitterMax * Math.random();
          return staleThreshold * 1e3 * backoff * (1 + jitter);
        }
        reconnectIfStale() {
          if (this.connectionIsStale()) {
            logger_default.log(`ConnectionMonitor detected stale connection. reconnectAttempts = ${this.reconnectAttempts}, time stale = ${secondsSince(this.refreshedAt)} s, stale threshold = ${this.constructor.staleThreshold} s`);
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              logger_default.log(`ConnectionMonitor skipping reopening recent disconnect. time disconnected = ${secondsSince(this.disconnectedAt)} s`);
            } else {
              logger_default.log("ConnectionMonitor reopening");
              this.connection.reopen();
            }
          }
        }
        get refreshedAt() {
          return this.pingedAt ? this.pingedAt : this.startedAt;
        }
        connectionIsStale() {
          return secondsSince(this.refreshedAt) > this.constructor.staleThreshold;
        }
        disconnectedRecently() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        }
        visibilityDidChange() {
          if (document.visibilityState === "visible") {
            setTimeout(
              () => {
                if (this.connectionIsStale() || !this.connection.isOpen()) {
                  logger_default.log(`ConnectionMonitor reopening stale connection on visibilitychange. visibilityState = ${document.visibilityState}`);
                  this.connection.reopen();
                }
              },
              200
            );
          }
        }
      };
      ConnectionMonitor.staleThreshold = 6;
      ConnectionMonitor.reconnectionBackoffRate = 0.15;
      connection_monitor_default = ConnectionMonitor;
    }
  });

  // node_modules/@rails/actioncable/src/internal.js
  var internal_default;
  var init_internal = __esm({
    "node_modules/@rails/actioncable/src/internal.js"() {
      internal_default = {
        "message_types": {
          "welcome": "welcome",
          "disconnect": "disconnect",
          "ping": "ping",
          "confirmation": "confirm_subscription",
          "rejection": "reject_subscription"
        },
        "disconnect_reasons": {
          "unauthorized": "unauthorized",
          "invalid_request": "invalid_request",
          "server_restart": "server_restart",
          "remote": "remote"
        },
        "default_mount_path": "/cable",
        "protocols": [
          "actioncable-v1-json",
          "actioncable-unsupported"
        ]
      };
    }
  });

  // node_modules/@rails/actioncable/src/connection.js
  var message_types, protocols, supportedProtocols, indexOf, Connection, connection_default;
  var init_connection = __esm({
    "node_modules/@rails/actioncable/src/connection.js"() {
      init_adapters();
      init_connection_monitor();
      init_internal();
      init_logger();
      ({ message_types, protocols } = internal_default);
      supportedProtocols = protocols.slice(0, protocols.length - 1);
      indexOf = [].indexOf;
      Connection = class {
        constructor(consumer2) {
          this.open = this.open.bind(this);
          this.consumer = consumer2;
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new connection_monitor_default(this);
          this.disconnected = true;
        }
        send(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        }
        open() {
          if (this.isActive()) {
            logger_default.log(`Attempted to open WebSocket, but existing socket is ${this.getState()}`);
            return false;
          } else {
            const socketProtocols = [...protocols, ...this.consumer.subprotocols || []];
            logger_default.log(`Opening WebSocket, current state is ${this.getState()}, subprotocols: ${socketProtocols}`);
            if (this.webSocket) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new adapters_default.WebSocket(this.consumer.url, socketProtocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        }
        close({ allowReconnect } = { allowReconnect: true }) {
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isOpen()) {
            return this.webSocket.close();
          }
        }
        reopen() {
          logger_default.log(`Reopening WebSocket, current state is ${this.getState()}`);
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error2) {
              logger_default.log("Failed to reopen WebSocket", error2);
            } finally {
              logger_default.log(`Reopening WebSocket in ${this.constructor.reopenDelay}ms`);
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        }
        getProtocol() {
          if (this.webSocket) {
            return this.webSocket.protocol;
          }
        }
        isOpen() {
          return this.isState("open");
        }
        isActive() {
          return this.isState("open", "connecting");
        }
        triedToReconnect() {
          return this.monitor.reconnectAttempts > 0;
        }
        // Private
        isProtocolSupported() {
          return indexOf.call(supportedProtocols, this.getProtocol()) >= 0;
        }
        isState(...states) {
          return indexOf.call(states, this.getState()) >= 0;
        }
        getState() {
          if (this.webSocket) {
            for (let state in adapters_default.WebSocket) {
              if (adapters_default.WebSocket[state] === this.webSocket.readyState) {
                return state.toLowerCase();
              }
            }
          }
          return null;
        }
        installEventHandlers() {
          for (let eventName in this.events) {
            const handler = this.events[eventName].bind(this);
            this.webSocket[`on${eventName}`] = handler;
          }
        }
        uninstallEventHandlers() {
          for (let eventName in this.events) {
            this.webSocket[`on${eventName}`] = function() {
            };
          }
        }
      };
      Connection.reopenDelay = 500;
      Connection.prototype.events = {
        message(event) {
          if (!this.isProtocolSupported()) {
            return;
          }
          const { identifier, message, reason, reconnect, type } = JSON.parse(event.data);
          switch (type) {
            case message_types.welcome:
              if (this.triedToReconnect()) {
                this.reconnectAttempted = true;
              }
              this.monitor.recordConnect();
              return this.subscriptions.reload();
            case message_types.disconnect:
              logger_default.log(`Disconnecting. Reason: ${reason}`);
              return this.close({ allowReconnect: reconnect });
            case message_types.ping:
              return this.monitor.recordPing();
            case message_types.confirmation:
              this.subscriptions.confirmSubscription(identifier);
              if (this.reconnectAttempted) {
                this.reconnectAttempted = false;
                return this.subscriptions.notify(identifier, "connected", { reconnected: true });
              } else {
                return this.subscriptions.notify(identifier, "connected", { reconnected: false });
              }
            case message_types.rejection:
              return this.subscriptions.reject(identifier);
            default:
              return this.subscriptions.notify(identifier, "received", message);
          }
        },
        open() {
          logger_default.log(`WebSocket onopen event, using '${this.getProtocol()}' subprotocol`);
          this.disconnected = false;
          if (!this.isProtocolSupported()) {
            logger_default.log("Protocol is unsupported. Stopping monitor and disconnecting.");
            return this.close({ allowReconnect: false });
          }
        },
        close(event) {
          logger_default.log("WebSocket onclose event");
          if (this.disconnected) {
            return;
          }
          this.disconnected = true;
          this.monitor.recordDisconnect();
          return this.subscriptions.notifyAll("disconnected", { willAttemptReconnect: this.monitor.isRunning() });
        },
        error() {
          logger_default.log("WebSocket onerror event");
        }
      };
      connection_default = Connection;
    }
  });

  // node_modules/@rails/actioncable/src/subscription.js
  var extend, Subscription;
  var init_subscription = __esm({
    "node_modules/@rails/actioncable/src/subscription.js"() {
      extend = function(object, properties) {
        if (properties != null) {
          for (let key in properties) {
            const value = properties[key];
            object[key] = value;
          }
        }
        return object;
      };
      Subscription = class {
        constructor(consumer2, params = {}, mixin) {
          this.consumer = consumer2;
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }
        // Perform a channel action with the optional data passed as an attribute
        perform(action, data = {}) {
          data.action = action;
          return this.send(data);
        }
        send(data) {
          return this.consumer.send({ command: "message", identifier: this.identifier, data: JSON.stringify(data) });
        }
        unsubscribe() {
          return this.consumer.subscriptions.remove(this);
        }
      };
    }
  });

  // node_modules/@rails/actioncable/src/subscription_guarantor.js
  var SubscriptionGuarantor, subscription_guarantor_default;
  var init_subscription_guarantor = __esm({
    "node_modules/@rails/actioncable/src/subscription_guarantor.js"() {
      init_logger();
      SubscriptionGuarantor = class {
        constructor(subscriptions) {
          this.subscriptions = subscriptions;
          this.pendingSubscriptions = [];
        }
        guarantee(subscription) {
          if (this.pendingSubscriptions.indexOf(subscription) == -1) {
            logger_default.log(`SubscriptionGuarantor guaranteeing ${subscription.identifier}`);
            this.pendingSubscriptions.push(subscription);
          } else {
            logger_default.log(`SubscriptionGuarantor already guaranteeing ${subscription.identifier}`);
          }
          this.startGuaranteeing();
        }
        forget(subscription) {
          logger_default.log(`SubscriptionGuarantor forgetting ${subscription.identifier}`);
          this.pendingSubscriptions = this.pendingSubscriptions.filter((s2) => s2 !== subscription);
        }
        startGuaranteeing() {
          this.stopGuaranteeing();
          this.retrySubscribing();
        }
        stopGuaranteeing() {
          clearTimeout(this.retryTimeout);
        }
        retrySubscribing() {
          this.retryTimeout = setTimeout(
            () => {
              if (this.subscriptions && typeof this.subscriptions.subscribe === "function") {
                this.pendingSubscriptions.map((subscription) => {
                  logger_default.log(`SubscriptionGuarantor resubscribing ${subscription.identifier}`);
                  this.subscriptions.subscribe(subscription);
                });
              }
            },
            500
          );
        }
      };
      subscription_guarantor_default = SubscriptionGuarantor;
    }
  });

  // node_modules/@rails/actioncable/src/subscriptions.js
  var Subscriptions;
  var init_subscriptions = __esm({
    "node_modules/@rails/actioncable/src/subscriptions.js"() {
      init_subscription();
      init_subscription_guarantor();
      init_logger();
      Subscriptions = class {
        constructor(consumer2) {
          this.consumer = consumer2;
          this.guarantor = new subscription_guarantor_default(this);
          this.subscriptions = [];
        }
        create(channelName, mixin) {
          const channel = channelName;
          const params = typeof channel === "object" ? channel : { channel };
          const subscription = new Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        }
        // Private
        add(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.subscribe(subscription);
          return subscription;
        }
        remove(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        }
        reject(identifier) {
          return this.findAll(identifier).map((subscription) => {
            this.forget(subscription);
            this.notify(subscription, "rejected");
            return subscription;
          });
        }
        forget(subscription) {
          this.guarantor.forget(subscription);
          this.subscriptions = this.subscriptions.filter((s2) => s2 !== subscription);
          return subscription;
        }
        findAll(identifier) {
          return this.subscriptions.filter((s2) => s2.identifier === identifier);
        }
        reload() {
          return this.subscriptions.map((subscription) => this.subscribe(subscription));
        }
        notifyAll(callbackName, ...args) {
          return this.subscriptions.map((subscription) => this.notify(subscription, callbackName, ...args));
        }
        notify(subscription, callbackName, ...args) {
          let subscriptions;
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          return subscriptions.map((subscription2) => typeof subscription2[callbackName] === "function" ? subscription2[callbackName](...args) : void 0);
        }
        subscribe(subscription) {
          if (this.sendCommand(subscription, "subscribe")) {
            this.guarantor.guarantee(subscription);
          }
        }
        confirmSubscription(identifier) {
          logger_default.log(`Subscription confirmed ${identifier}`);
          this.findAll(identifier).map((subscription) => this.guarantor.forget(subscription));
        }
        sendCommand(subscription, command) {
          const { identifier } = subscription;
          return this.consumer.send({ command, identifier });
        }
      };
    }
  });

  // node_modules/@rails/actioncable/src/consumer.js
  function createWebSocketURL(url) {
    if (typeof url === "function") {
      url = url();
    }
    if (url && !/^wss?:/i.test(url)) {
      const a2 = document.createElement("a");
      a2.href = url;
      a2.href = a2.href;
      a2.protocol = a2.protocol.replace("http", "ws");
      return a2.href;
    } else {
      return url;
    }
  }
  var Consumer;
  var init_consumer = __esm({
    "node_modules/@rails/actioncable/src/consumer.js"() {
      init_connection();
      init_subscriptions();
      Consumer = class {
        constructor(url) {
          this._url = url;
          this.subscriptions = new Subscriptions(this);
          this.connection = new connection_default(this);
          this.subprotocols = [];
        }
        get url() {
          return createWebSocketURL(this._url);
        }
        send(data) {
          return this.connection.send(data);
        }
        connect() {
          return this.connection.open();
        }
        disconnect() {
          return this.connection.close({ allowReconnect: false });
        }
        ensureActiveConnection() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        }
        addSubProtocol(subprotocol) {
          this.subprotocols = [...this.subprotocols, subprotocol];
        }
      };
    }
  });

  // node_modules/@rails/actioncable/src/index.js
  var src_exports = {};
  __export(src_exports, {
    Connection: () => connection_default,
    ConnectionMonitor: () => connection_monitor_default,
    Consumer: () => Consumer,
    INTERNAL: () => internal_default,
    Subscription: () => Subscription,
    SubscriptionGuarantor: () => subscription_guarantor_default,
    Subscriptions: () => Subscriptions,
    adapters: () => adapters_default,
    createConsumer: () => createConsumer,
    createWebSocketURL: () => createWebSocketURL,
    getConfig: () => getConfig,
    logger: () => logger_default
  });
  function createConsumer(url = getConfig("url") || internal_default.default_mount_path) {
    return new Consumer(url);
  }
  function getConfig(name) {
    const element = document.head.querySelector(`meta[name='action-cable-${name}']`);
    if (element) {
      return element.getAttribute("content");
    }
  }
  var init_src = __esm({
    "node_modules/@rails/actioncable/src/index.js"() {
      init_connection();
      init_connection_monitor();
      init_consumer();
      init_internal();
      init_subscription();
      init_subscriptions();
      init_subscription_guarantor();
      init_adapters();
      init_logger();
    }
  });

  // node_modules/@popperjs/core/dist/cjs/popper.js
  var require_popper = __commonJS({
    "node_modules/@popperjs/core/dist/cjs/popper.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      function getWindow(node) {
        if (node == null) {
          return window;
        }
        if (node.toString() !== "[object Window]") {
          var ownerDocument = node.ownerDocument;
          return ownerDocument ? ownerDocument.defaultView || window : window;
        }
        return node;
      }
      function isElement(node) {
        var OwnElement = getWindow(node).Element;
        return node instanceof OwnElement || node instanceof Element;
      }
      function isHTMLElement(node) {
        var OwnElement = getWindow(node).HTMLElement;
        return node instanceof OwnElement || node instanceof HTMLElement;
      }
      function isShadowRoot(node) {
        if (typeof ShadowRoot === "undefined") {
          return false;
        }
        var OwnElement = getWindow(node).ShadowRoot;
        return node instanceof OwnElement || node instanceof ShadowRoot;
      }
      var max = Math.max;
      var min = Math.min;
      var round = Math.round;
      function getUAString() {
        var uaData = navigator.userAgentData;
        if (uaData != null && uaData.brands && Array.isArray(uaData.brands)) {
          return uaData.brands.map(function(item) {
            return item.brand + "/" + item.version;
          }).join(" ");
        }
        return navigator.userAgent;
      }
      function isLayoutViewport() {
        return !/^((?!chrome|android).)*safari/i.test(getUAString());
      }
      function getBoundingClientRect(element, includeScale, isFixedStrategy) {
        if (includeScale === void 0) {
          includeScale = false;
        }
        if (isFixedStrategy === void 0) {
          isFixedStrategy = false;
        }
        var clientRect = element.getBoundingClientRect();
        var scaleX = 1;
        var scaleY = 1;
        if (includeScale && isHTMLElement(element)) {
          scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
          scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
        }
        var _ref = isElement(element) ? getWindow(element) : window, visualViewport = _ref.visualViewport;
        var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
        var x2 = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
        var y2 = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
        var width = clientRect.width / scaleX;
        var height = clientRect.height / scaleY;
        return {
          width,
          height,
          top: y2,
          right: x2 + width,
          bottom: y2 + height,
          left: x2,
          x: x2,
          y: y2
        };
      }
      function getWindowScroll(node) {
        var win = getWindow(node);
        var scrollLeft = win.pageXOffset;
        var scrollTop = win.pageYOffset;
        return {
          scrollLeft,
          scrollTop
        };
      }
      function getHTMLElementScroll(element) {
        return {
          scrollLeft: element.scrollLeft,
          scrollTop: element.scrollTop
        };
      }
      function getNodeScroll(node) {
        if (node === getWindow(node) || !isHTMLElement(node)) {
          return getWindowScroll(node);
        } else {
          return getHTMLElementScroll(node);
        }
      }
      function getNodeName(element) {
        return element ? (element.nodeName || "").toLowerCase() : null;
      }
      function getDocumentElement(element) {
        return ((isElement(element) ? element.ownerDocument : (
          // $FlowFixMe[prop-missing]
          element.document
        )) || window.document).documentElement;
      }
      function getWindowScrollBarX(element) {
        return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
      }
      function getComputedStyle2(element) {
        return getWindow(element).getComputedStyle(element);
      }
      function isScrollParent(element) {
        var _getComputedStyle = getComputedStyle2(element), overflow = _getComputedStyle.overflow, overflowX = _getComputedStyle.overflowX, overflowY = _getComputedStyle.overflowY;
        return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
      }
      function isElementScaled(element) {
        var rect = element.getBoundingClientRect();
        var scaleX = round(rect.width) / element.offsetWidth || 1;
        var scaleY = round(rect.height) / element.offsetHeight || 1;
        return scaleX !== 1 || scaleY !== 1;
      }
      function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
        if (isFixed === void 0) {
          isFixed = false;
        }
        var isOffsetParentAnElement = isHTMLElement(offsetParent);
        var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
        var documentElement = getDocumentElement(offsetParent);
        var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
        var scroll = {
          scrollLeft: 0,
          scrollTop: 0
        };
        var offsets = {
          x: 0,
          y: 0
        };
        if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
          if (getNodeName(offsetParent) !== "body" || // https://github.com/popperjs/popper-core/issues/1078
          isScrollParent(documentElement)) {
            scroll = getNodeScroll(offsetParent);
          }
          if (isHTMLElement(offsetParent)) {
            offsets = getBoundingClientRect(offsetParent, true);
            offsets.x += offsetParent.clientLeft;
            offsets.y += offsetParent.clientTop;
          } else if (documentElement) {
            offsets.x = getWindowScrollBarX(documentElement);
          }
        }
        return {
          x: rect.left + scroll.scrollLeft - offsets.x,
          y: rect.top + scroll.scrollTop - offsets.y,
          width: rect.width,
          height: rect.height
        };
      }
      function getLayoutRect(element) {
        var clientRect = getBoundingClientRect(element);
        var width = element.offsetWidth;
        var height = element.offsetHeight;
        if (Math.abs(clientRect.width - width) <= 1) {
          width = clientRect.width;
        }
        if (Math.abs(clientRect.height - height) <= 1) {
          height = clientRect.height;
        }
        return {
          x: element.offsetLeft,
          y: element.offsetTop,
          width,
          height
        };
      }
      function getParentNode(element) {
        if (getNodeName(element) === "html") {
          return element;
        }
        return (
          // this is a quicker (but less type safe) way to save quite some bytes from the bundle
          // $FlowFixMe[incompatible-return]
          // $FlowFixMe[prop-missing]
          element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
          element.parentNode || // DOM Element detected
          (isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
          // $FlowFixMe[incompatible-call]: HTMLElement is a Node
          getDocumentElement(element)
        );
      }
      function getScrollParent(node) {
        if (["html", "body", "#document"].indexOf(getNodeName(node)) >= 0) {
          return node.ownerDocument.body;
        }
        if (isHTMLElement(node) && isScrollParent(node)) {
          return node;
        }
        return getScrollParent(getParentNode(node));
      }
      function listScrollParents(element, list) {
        var _element$ownerDocumen;
        if (list === void 0) {
          list = [];
        }
        var scrollParent = getScrollParent(element);
        var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
        var win = getWindow(scrollParent);
        var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
        var updatedList = list.concat(target);
        return isBody ? updatedList : (
          // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
          updatedList.concat(listScrollParents(getParentNode(target)))
        );
      }
      function isTableElement(element) {
        return ["table", "td", "th"].indexOf(getNodeName(element)) >= 0;
      }
      function getTrueOffsetParent(element) {
        if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
        getComputedStyle2(element).position === "fixed") {
          return null;
        }
        return element.offsetParent;
      }
      function getContainingBlock(element) {
        var isFirefox = /firefox/i.test(getUAString());
        var isIE = /Trident/i.test(getUAString());
        if (isIE && isHTMLElement(element)) {
          var elementCss = getComputedStyle2(element);
          if (elementCss.position === "fixed") {
            return null;
          }
        }
        var currentNode = getParentNode(element);
        if (isShadowRoot(currentNode)) {
          currentNode = currentNode.host;
        }
        while (isHTMLElement(currentNode) && ["html", "body"].indexOf(getNodeName(currentNode)) < 0) {
          var css = getComputedStyle2(currentNode);
          if (css.transform !== "none" || css.perspective !== "none" || css.contain === "paint" || ["transform", "perspective"].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === "filter" || isFirefox && css.filter && css.filter !== "none") {
            return currentNode;
          } else {
            currentNode = currentNode.parentNode;
          }
        }
        return null;
      }
      function getOffsetParent(element) {
        var window2 = getWindow(element);
        var offsetParent = getTrueOffsetParent(element);
        while (offsetParent && isTableElement(offsetParent) && getComputedStyle2(offsetParent).position === "static") {
          offsetParent = getTrueOffsetParent(offsetParent);
        }
        if (offsetParent && (getNodeName(offsetParent) === "html" || getNodeName(offsetParent) === "body" && getComputedStyle2(offsetParent).position === "static")) {
          return window2;
        }
        return offsetParent || getContainingBlock(element) || window2;
      }
      var top = "top";
      var bottom = "bottom";
      var right = "right";
      var left = "left";
      var auto = "auto";
      var basePlacements = [top, bottom, right, left];
      var start2 = "start";
      var end = "end";
      var clippingParents = "clippingParents";
      var viewport = "viewport";
      var popper = "popper";
      var reference = "reference";
      var variationPlacements = /* @__PURE__ */ basePlacements.reduce(function(acc, placement) {
        return acc.concat([placement + "-" + start2, placement + "-" + end]);
      }, []);
      var placements = /* @__PURE__ */ [].concat(basePlacements, [auto]).reduce(function(acc, placement) {
        return acc.concat([placement, placement + "-" + start2, placement + "-" + end]);
      }, []);
      var beforeRead = "beforeRead";
      var read = "read";
      var afterRead = "afterRead";
      var beforeMain = "beforeMain";
      var main = "main";
      var afterMain = "afterMain";
      var beforeWrite = "beforeWrite";
      var write = "write";
      var afterWrite = "afterWrite";
      var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];
      function order(modifiers) {
        var map = /* @__PURE__ */ new Map();
        var visited = /* @__PURE__ */ new Set();
        var result = [];
        modifiers.forEach(function(modifier) {
          map.set(modifier.name, modifier);
        });
        function sort(modifier) {
          visited.add(modifier.name);
          var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
          requires.forEach(function(dep) {
            if (!visited.has(dep)) {
              var depModifier = map.get(dep);
              if (depModifier) {
                sort(depModifier);
              }
            }
          });
          result.push(modifier);
        }
        modifiers.forEach(function(modifier) {
          if (!visited.has(modifier.name)) {
            sort(modifier);
          }
        });
        return result;
      }
      function orderModifiers(modifiers) {
        var orderedModifiers = order(modifiers);
        return modifierPhases.reduce(function(acc, phase) {
          return acc.concat(orderedModifiers.filter(function(modifier) {
            return modifier.phase === phase;
          }));
        }, []);
      }
      function debounce2(fn) {
        var pending;
        return function() {
          if (!pending) {
            pending = new Promise(function(resolve) {
              Promise.resolve().then(function() {
                pending = void 0;
                resolve(fn());
              });
            });
          }
          return pending;
        };
      }
      function mergeByName(modifiers) {
        var merged = modifiers.reduce(function(merged2, current) {
          var existing = merged2[current.name];
          merged2[current.name] = existing ? Object.assign({}, existing, current, {
            options: Object.assign({}, existing.options, current.options),
            data: Object.assign({}, existing.data, current.data)
          }) : current;
          return merged2;
        }, {});
        return Object.keys(merged).map(function(key) {
          return merged[key];
        });
      }
      function getViewportRect(element, strategy) {
        var win = getWindow(element);
        var html = getDocumentElement(element);
        var visualViewport = win.visualViewport;
        var width = html.clientWidth;
        var height = html.clientHeight;
        var x2 = 0;
        var y2 = 0;
        if (visualViewport) {
          width = visualViewport.width;
          height = visualViewport.height;
          var layoutViewport = isLayoutViewport();
          if (layoutViewport || !layoutViewport && strategy === "fixed") {
            x2 = visualViewport.offsetLeft;
            y2 = visualViewport.offsetTop;
          }
        }
        return {
          width,
          height,
          x: x2 + getWindowScrollBarX(element),
          y: y2
        };
      }
      function getDocumentRect(element) {
        var _element$ownerDocumen;
        var html = getDocumentElement(element);
        var winScroll = getWindowScroll(element);
        var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
        var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
        var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
        var x2 = -winScroll.scrollLeft + getWindowScrollBarX(element);
        var y2 = -winScroll.scrollTop;
        if (getComputedStyle2(body || html).direction === "rtl") {
          x2 += max(html.clientWidth, body ? body.clientWidth : 0) - width;
        }
        return {
          width,
          height,
          x: x2,
          y: y2
        };
      }
      function contains(parent, child) {
        var rootNode = child.getRootNode && child.getRootNode();
        if (parent.contains(child)) {
          return true;
        } else if (rootNode && isShadowRoot(rootNode)) {
          var next = child;
          do {
            if (next && parent.isSameNode(next)) {
              return true;
            }
            next = next.parentNode || next.host;
          } while (next);
        }
        return false;
      }
      function rectToClientRect(rect) {
        return Object.assign({}, rect, {
          left: rect.x,
          top: rect.y,
          right: rect.x + rect.width,
          bottom: rect.y + rect.height
        });
      }
      function getInnerBoundingClientRect(element, strategy) {
        var rect = getBoundingClientRect(element, false, strategy === "fixed");
        rect.top = rect.top + element.clientTop;
        rect.left = rect.left + element.clientLeft;
        rect.bottom = rect.top + element.clientHeight;
        rect.right = rect.left + element.clientWidth;
        rect.width = element.clientWidth;
        rect.height = element.clientHeight;
        rect.x = rect.left;
        rect.y = rect.top;
        return rect;
      }
      function getClientRectFromMixedType(element, clippingParent, strategy) {
        return clippingParent === viewport ? rectToClientRect(getViewportRect(element, strategy)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
      }
      function getClippingParents(element) {
        var clippingParents2 = listScrollParents(getParentNode(element));
        var canEscapeClipping = ["absolute", "fixed"].indexOf(getComputedStyle2(element).position) >= 0;
        var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;
        if (!isElement(clipperElement)) {
          return [];
        }
        return clippingParents2.filter(function(clippingParent) {
          return isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== "body";
        });
      }
      function getClippingRect(element, boundary, rootBoundary, strategy) {
        var mainClippingParents = boundary === "clippingParents" ? getClippingParents(element) : [].concat(boundary);
        var clippingParents2 = [].concat(mainClippingParents, [rootBoundary]);
        var firstClippingParent = clippingParents2[0];
        var clippingRect = clippingParents2.reduce(function(accRect, clippingParent) {
          var rect = getClientRectFromMixedType(element, clippingParent, strategy);
          accRect.top = max(rect.top, accRect.top);
          accRect.right = min(rect.right, accRect.right);
          accRect.bottom = min(rect.bottom, accRect.bottom);
          accRect.left = max(rect.left, accRect.left);
          return accRect;
        }, getClientRectFromMixedType(element, firstClippingParent, strategy));
        clippingRect.width = clippingRect.right - clippingRect.left;
        clippingRect.height = clippingRect.bottom - clippingRect.top;
        clippingRect.x = clippingRect.left;
        clippingRect.y = clippingRect.top;
        return clippingRect;
      }
      function getBasePlacement(placement) {
        return placement.split("-")[0];
      }
      function getVariation(placement) {
        return placement.split("-")[1];
      }
      function getMainAxisFromPlacement(placement) {
        return ["top", "bottom"].indexOf(placement) >= 0 ? "x" : "y";
      }
      function computeOffsets(_ref) {
        var reference2 = _ref.reference, element = _ref.element, placement = _ref.placement;
        var basePlacement = placement ? getBasePlacement(placement) : null;
        var variation = placement ? getVariation(placement) : null;
        var commonX = reference2.x + reference2.width / 2 - element.width / 2;
        var commonY = reference2.y + reference2.height / 2 - element.height / 2;
        var offsets;
        switch (basePlacement) {
          case top:
            offsets = {
              x: commonX,
              y: reference2.y - element.height
            };
            break;
          case bottom:
            offsets = {
              x: commonX,
              y: reference2.y + reference2.height
            };
            break;
          case right:
            offsets = {
              x: reference2.x + reference2.width,
              y: commonY
            };
            break;
          case left:
            offsets = {
              x: reference2.x - element.width,
              y: commonY
            };
            break;
          default:
            offsets = {
              x: reference2.x,
              y: reference2.y
            };
        }
        var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;
        if (mainAxis != null) {
          var len = mainAxis === "y" ? "height" : "width";
          switch (variation) {
            case start2:
              offsets[mainAxis] = offsets[mainAxis] - (reference2[len] / 2 - element[len] / 2);
              break;
            case end:
              offsets[mainAxis] = offsets[mainAxis] + (reference2[len] / 2 - element[len] / 2);
              break;
          }
        }
        return offsets;
      }
      function getFreshSideObject() {
        return {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        };
      }
      function mergePaddingObject(paddingObject) {
        return Object.assign({}, getFreshSideObject(), paddingObject);
      }
      function expandToHashMap(value, keys) {
        return keys.reduce(function(hashMap, key) {
          hashMap[key] = value;
          return hashMap;
        }, {});
      }
      function detectOverflow(state, options) {
        if (options === void 0) {
          options = {};
        }
        var _options = options, _options$placement = _options.placement, placement = _options$placement === void 0 ? state.placement : _options$placement, _options$strategy = _options.strategy, strategy = _options$strategy === void 0 ? state.strategy : _options$strategy, _options$boundary = _options.boundary, boundary = _options$boundary === void 0 ? clippingParents : _options$boundary, _options$rootBoundary = _options.rootBoundary, rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary, _options$elementConte = _options.elementContext, elementContext = _options$elementConte === void 0 ? popper : _options$elementConte, _options$altBoundary = _options.altBoundary, altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary, _options$padding = _options.padding, padding = _options$padding === void 0 ? 0 : _options$padding;
        var paddingObject = mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
        var altContext = elementContext === popper ? reference : popper;
        var popperRect = state.rects.popper;
        var element = state.elements[altBoundary ? altContext : elementContext];
        var clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary, strategy);
        var referenceClientRect = getBoundingClientRect(state.elements.reference);
        var popperOffsets2 = computeOffsets({
          reference: referenceClientRect,
          element: popperRect,
          strategy: "absolute",
          placement
        });
        var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets2));
        var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect;
        var overflowOffsets = {
          top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
          bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
          left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
          right: elementClientRect.right - clippingClientRect.right + paddingObject.right
        };
        var offsetData = state.modifiersData.offset;
        if (elementContext === popper && offsetData) {
          var offset2 = offsetData[placement];
          Object.keys(overflowOffsets).forEach(function(key) {
            var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
            var axis = [top, bottom].indexOf(key) >= 0 ? "y" : "x";
            overflowOffsets[key] += offset2[axis] * multiply;
          });
        }
        return overflowOffsets;
      }
      var DEFAULT_OPTIONS = {
        placement: "bottom",
        modifiers: [],
        strategy: "absolute"
      };
      function areValidElements() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        return !args.some(function(element) {
          return !(element && typeof element.getBoundingClientRect === "function");
        });
      }
      function popperGenerator(generatorOptions) {
        if (generatorOptions === void 0) {
          generatorOptions = {};
        }
        var _generatorOptions = generatorOptions, _generatorOptions$def = _generatorOptions.defaultModifiers, defaultModifiers2 = _generatorOptions$def === void 0 ? [] : _generatorOptions$def, _generatorOptions$def2 = _generatorOptions.defaultOptions, defaultOptions2 = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
        return function createPopper2(reference2, popper2, options) {
          if (options === void 0) {
            options = defaultOptions2;
          }
          var state = {
            placement: "bottom",
            orderedModifiers: [],
            options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions2),
            modifiersData: {},
            elements: {
              reference: reference2,
              popper: popper2
            },
            attributes: {},
            styles: {}
          };
          var effectCleanupFns = [];
          var isDestroyed = false;
          var instance = {
            state,
            setOptions: function setOptions(setOptionsAction) {
              var options2 = typeof setOptionsAction === "function" ? setOptionsAction(state.options) : setOptionsAction;
              cleanupModifierEffects();
              state.options = Object.assign({}, defaultOptions2, state.options, options2);
              state.scrollParents = {
                reference: isElement(reference2) ? listScrollParents(reference2) : reference2.contextElement ? listScrollParents(reference2.contextElement) : [],
                popper: listScrollParents(popper2)
              };
              var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers2, state.options.modifiers)));
              state.orderedModifiers = orderedModifiers.filter(function(m2) {
                return m2.enabled;
              });
              runModifierEffects();
              return instance.update();
            },
            // Sync update – it will always be executed, even if not necessary. This
            // is useful for low frequency updates where sync behavior simplifies the
            // logic.
            // For high frequency updates (e.g. `resize` and `scroll` events), always
            // prefer the async Popper#update method
            forceUpdate: function forceUpdate() {
              if (isDestroyed) {
                return;
              }
              var _state$elements = state.elements, reference3 = _state$elements.reference, popper3 = _state$elements.popper;
              if (!areValidElements(reference3, popper3)) {
                return;
              }
              state.rects = {
                reference: getCompositeRect(reference3, getOffsetParent(popper3), state.options.strategy === "fixed"),
                popper: getLayoutRect(popper3)
              };
              state.reset = false;
              state.placement = state.options.placement;
              state.orderedModifiers.forEach(function(modifier) {
                return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
              });
              for (var index = 0; index < state.orderedModifiers.length; index++) {
                if (state.reset === true) {
                  state.reset = false;
                  index = -1;
                  continue;
                }
                var _state$orderedModifie = state.orderedModifiers[index], fn = _state$orderedModifie.fn, _state$orderedModifie2 = _state$orderedModifie.options, _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2, name = _state$orderedModifie.name;
                if (typeof fn === "function") {
                  state = fn({
                    state,
                    options: _options,
                    name,
                    instance
                  }) || state;
                }
              }
            },
            // Async and optimistically optimized update – it will not be executed if
            // not necessary (debounced to run at most once-per-tick)
            update: debounce2(function() {
              return new Promise(function(resolve) {
                instance.forceUpdate();
                resolve(state);
              });
            }),
            destroy: function destroy() {
              cleanupModifierEffects();
              isDestroyed = true;
            }
          };
          if (!areValidElements(reference2, popper2)) {
            return instance;
          }
          instance.setOptions(options).then(function(state2) {
            if (!isDestroyed && options.onFirstUpdate) {
              options.onFirstUpdate(state2);
            }
          });
          function runModifierEffects() {
            state.orderedModifiers.forEach(function(_ref) {
              var name = _ref.name, _ref$options = _ref.options, options2 = _ref$options === void 0 ? {} : _ref$options, effect2 = _ref.effect;
              if (typeof effect2 === "function") {
                var cleanupFn = effect2({
                  state,
                  name,
                  instance,
                  options: options2
                });
                var noopFn = function noopFn2() {
                };
                effectCleanupFns.push(cleanupFn || noopFn);
              }
            });
          }
          function cleanupModifierEffects() {
            effectCleanupFns.forEach(function(fn) {
              return fn();
            });
            effectCleanupFns = [];
          }
          return instance;
        };
      }
      var passive = {
        passive: true
      };
      function effect$2(_ref) {
        var state = _ref.state, instance = _ref.instance, options = _ref.options;
        var _options$scroll = options.scroll, scroll = _options$scroll === void 0 ? true : _options$scroll, _options$resize = options.resize, resize = _options$resize === void 0 ? true : _options$resize;
        var window2 = getWindow(state.elements.popper);
        var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);
        if (scroll) {
          scrollParents.forEach(function(scrollParent) {
            scrollParent.addEventListener("scroll", instance.update, passive);
          });
        }
        if (resize) {
          window2.addEventListener("resize", instance.update, passive);
        }
        return function() {
          if (scroll) {
            scrollParents.forEach(function(scrollParent) {
              scrollParent.removeEventListener("scroll", instance.update, passive);
            });
          }
          if (resize) {
            window2.removeEventListener("resize", instance.update, passive);
          }
        };
      }
      var eventListeners = {
        name: "eventListeners",
        enabled: true,
        phase: "write",
        fn: function fn() {
        },
        effect: effect$2,
        data: {}
      };
      function popperOffsets(_ref) {
        var state = _ref.state, name = _ref.name;
        state.modifiersData[name] = computeOffsets({
          reference: state.rects.reference,
          element: state.rects.popper,
          strategy: "absolute",
          placement: state.placement
        });
      }
      var popperOffsets$1 = {
        name: "popperOffsets",
        enabled: true,
        phase: "read",
        fn: popperOffsets,
        data: {}
      };
      var unsetSides = {
        top: "auto",
        right: "auto",
        bottom: "auto",
        left: "auto"
      };
      function roundOffsetsByDPR(_ref, win) {
        var x2 = _ref.x, y2 = _ref.y;
        var dpr = win.devicePixelRatio || 1;
        return {
          x: round(x2 * dpr) / dpr || 0,
          y: round(y2 * dpr) / dpr || 0
        };
      }
      function mapToStyles(_ref2) {
        var _Object$assign2;
        var popper2 = _ref2.popper, popperRect = _ref2.popperRect, placement = _ref2.placement, variation = _ref2.variation, offsets = _ref2.offsets, position = _ref2.position, gpuAcceleration = _ref2.gpuAcceleration, adaptive = _ref2.adaptive, roundOffsets = _ref2.roundOffsets, isFixed = _ref2.isFixed;
        var _offsets$x = offsets.x, x2 = _offsets$x === void 0 ? 0 : _offsets$x, _offsets$y = offsets.y, y2 = _offsets$y === void 0 ? 0 : _offsets$y;
        var _ref3 = typeof roundOffsets === "function" ? roundOffsets({
          x: x2,
          y: y2
        }) : {
          x: x2,
          y: y2
        };
        x2 = _ref3.x;
        y2 = _ref3.y;
        var hasX = offsets.hasOwnProperty("x");
        var hasY = offsets.hasOwnProperty("y");
        var sideX = left;
        var sideY = top;
        var win = window;
        if (adaptive) {
          var offsetParent = getOffsetParent(popper2);
          var heightProp = "clientHeight";
          var widthProp = "clientWidth";
          if (offsetParent === getWindow(popper2)) {
            offsetParent = getDocumentElement(popper2);
            if (getComputedStyle2(offsetParent).position !== "static" && position === "absolute") {
              heightProp = "scrollHeight";
              widthProp = "scrollWidth";
            }
          }
          offsetParent = offsetParent;
          if (placement === top || (placement === left || placement === right) && variation === end) {
            sideY = bottom;
            var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : (
              // $FlowFixMe[prop-missing]
              offsetParent[heightProp]
            );
            y2 -= offsetY - popperRect.height;
            y2 *= gpuAcceleration ? 1 : -1;
          }
          if (placement === left || (placement === top || placement === bottom) && variation === end) {
            sideX = right;
            var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : (
              // $FlowFixMe[prop-missing]
              offsetParent[widthProp]
            );
            x2 -= offsetX - popperRect.width;
            x2 *= gpuAcceleration ? 1 : -1;
          }
        }
        var commonStyles = Object.assign({
          position
        }, adaptive && unsetSides);
        var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
          x: x2,
          y: y2
        }, getWindow(popper2)) : {
          x: x2,
          y: y2
        };
        x2 = _ref4.x;
        y2 = _ref4.y;
        if (gpuAcceleration) {
          var _Object$assign;
          return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? "0" : "", _Object$assign[sideX] = hasX ? "0" : "", _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x2 + "px, " + y2 + "px)" : "translate3d(" + x2 + "px, " + y2 + "px, 0)", _Object$assign));
        }
        return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y2 + "px" : "", _Object$assign2[sideX] = hasX ? x2 + "px" : "", _Object$assign2.transform = "", _Object$assign2));
      }
      function computeStyles(_ref5) {
        var state = _ref5.state, options = _ref5.options;
        var _options$gpuAccelerat = options.gpuAcceleration, gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat, _options$adaptive = options.adaptive, adaptive = _options$adaptive === void 0 ? true : _options$adaptive, _options$roundOffsets = options.roundOffsets, roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
        var commonStyles = {
          placement: getBasePlacement(state.placement),
          variation: getVariation(state.placement),
          popper: state.elements.popper,
          popperRect: state.rects.popper,
          gpuAcceleration,
          isFixed: state.options.strategy === "fixed"
        };
        if (state.modifiersData.popperOffsets != null) {
          state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
            offsets: state.modifiersData.popperOffsets,
            position: state.options.strategy,
            adaptive,
            roundOffsets
          })));
        }
        if (state.modifiersData.arrow != null) {
          state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
            offsets: state.modifiersData.arrow,
            position: "absolute",
            adaptive: false,
            roundOffsets
          })));
        }
        state.attributes.popper = Object.assign({}, state.attributes.popper, {
          "data-popper-placement": state.placement
        });
      }
      var computeStyles$1 = {
        name: "computeStyles",
        enabled: true,
        phase: "beforeWrite",
        fn: computeStyles,
        data: {}
      };
      function applyStyles(_ref) {
        var state = _ref.state;
        Object.keys(state.elements).forEach(function(name) {
          var style = state.styles[name] || {};
          var attributes = state.attributes[name] || {};
          var element = state.elements[name];
          if (!isHTMLElement(element) || !getNodeName(element)) {
            return;
          }
          Object.assign(element.style, style);
          Object.keys(attributes).forEach(function(name2) {
            var value = attributes[name2];
            if (value === false) {
              element.removeAttribute(name2);
            } else {
              element.setAttribute(name2, value === true ? "" : value);
            }
          });
        });
      }
      function effect$1(_ref2) {
        var state = _ref2.state;
        var initialStyles = {
          popper: {
            position: state.options.strategy,
            left: "0",
            top: "0",
            margin: "0"
          },
          arrow: {
            position: "absolute"
          },
          reference: {}
        };
        Object.assign(state.elements.popper.style, initialStyles.popper);
        state.styles = initialStyles;
        if (state.elements.arrow) {
          Object.assign(state.elements.arrow.style, initialStyles.arrow);
        }
        return function() {
          Object.keys(state.elements).forEach(function(name) {
            var element = state.elements[name];
            var attributes = state.attributes[name] || {};
            var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]);
            var style = styleProperties.reduce(function(style2, property) {
              style2[property] = "";
              return style2;
            }, {});
            if (!isHTMLElement(element) || !getNodeName(element)) {
              return;
            }
            Object.assign(element.style, style);
            Object.keys(attributes).forEach(function(attribute) {
              element.removeAttribute(attribute);
            });
          });
        };
      }
      var applyStyles$1 = {
        name: "applyStyles",
        enabled: true,
        phase: "write",
        fn: applyStyles,
        effect: effect$1,
        requires: ["computeStyles"]
      };
      function distanceAndSkiddingToXY(placement, rects, offset2) {
        var basePlacement = getBasePlacement(placement);
        var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;
        var _ref = typeof offset2 === "function" ? offset2(Object.assign({}, rects, {
          placement
        })) : offset2, skidding = _ref[0], distance = _ref[1];
        skidding = skidding || 0;
        distance = (distance || 0) * invertDistance;
        return [left, right].indexOf(basePlacement) >= 0 ? {
          x: distance,
          y: skidding
        } : {
          x: skidding,
          y: distance
        };
      }
      function offset(_ref2) {
        var state = _ref2.state, options = _ref2.options, name = _ref2.name;
        var _options$offset = options.offset, offset2 = _options$offset === void 0 ? [0, 0] : _options$offset;
        var data = placements.reduce(function(acc, placement) {
          acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset2);
          return acc;
        }, {});
        var _data$state$placement = data[state.placement], x2 = _data$state$placement.x, y2 = _data$state$placement.y;
        if (state.modifiersData.popperOffsets != null) {
          state.modifiersData.popperOffsets.x += x2;
          state.modifiersData.popperOffsets.y += y2;
        }
        state.modifiersData[name] = data;
      }
      var offset$1 = {
        name: "offset",
        enabled: true,
        phase: "main",
        requires: ["popperOffsets"],
        fn: offset
      };
      var hash$1 = {
        left: "right",
        right: "left",
        bottom: "top",
        top: "bottom"
      };
      function getOppositePlacement(placement) {
        return placement.replace(/left|right|bottom|top/g, function(matched) {
          return hash$1[matched];
        });
      }
      var hash = {
        start: "end",
        end: "start"
      };
      function getOppositeVariationPlacement(placement) {
        return placement.replace(/start|end/g, function(matched) {
          return hash[matched];
        });
      }
      function computeAutoPlacement(state, options) {
        if (options === void 0) {
          options = {};
        }
        var _options = options, placement = _options.placement, boundary = _options.boundary, rootBoundary = _options.rootBoundary, padding = _options.padding, flipVariations = _options.flipVariations, _options$allowedAutoP = _options.allowedAutoPlacements, allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
        var variation = getVariation(placement);
        var placements$1 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function(placement2) {
          return getVariation(placement2) === variation;
        }) : basePlacements;
        var allowedPlacements = placements$1.filter(function(placement2) {
          return allowedAutoPlacements.indexOf(placement2) >= 0;
        });
        if (allowedPlacements.length === 0) {
          allowedPlacements = placements$1;
        }
        var overflows = allowedPlacements.reduce(function(acc, placement2) {
          acc[placement2] = detectOverflow(state, {
            placement: placement2,
            boundary,
            rootBoundary,
            padding
          })[getBasePlacement(placement2)];
          return acc;
        }, {});
        return Object.keys(overflows).sort(function(a2, b2) {
          return overflows[a2] - overflows[b2];
        });
      }
      function getExpandedFallbackPlacements(placement) {
        if (getBasePlacement(placement) === auto) {
          return [];
        }
        var oppositePlacement = getOppositePlacement(placement);
        return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
      }
      function flip(_ref) {
        var state = _ref.state, options = _ref.options, name = _ref.name;
        if (state.modifiersData[name]._skip) {
          return;
        }
        var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis, specifiedFallbackPlacements = options.fallbackPlacements, padding = options.padding, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, _options$flipVariatio = options.flipVariations, flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio, allowedAutoPlacements = options.allowedAutoPlacements;
        var preferredPlacement = state.options.placement;
        var basePlacement = getBasePlacement(preferredPlacement);
        var isBasePlacement = basePlacement === preferredPlacement;
        var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
        var placements2 = [preferredPlacement].concat(fallbackPlacements).reduce(function(acc, placement2) {
          return acc.concat(getBasePlacement(placement2) === auto ? computeAutoPlacement(state, {
            placement: placement2,
            boundary,
            rootBoundary,
            padding,
            flipVariations,
            allowedAutoPlacements
          }) : placement2);
        }, []);
        var referenceRect = state.rects.reference;
        var popperRect = state.rects.popper;
        var checksMap = /* @__PURE__ */ new Map();
        var makeFallbackChecks = true;
        var firstFittingPlacement = placements2[0];
        for (var i2 = 0; i2 < placements2.length; i2++) {
          var placement = placements2[i2];
          var _basePlacement = getBasePlacement(placement);
          var isStartVariation = getVariation(placement) === start2;
          var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
          var len = isVertical ? "width" : "height";
          var overflow = detectOverflow(state, {
            placement,
            boundary,
            rootBoundary,
            altBoundary,
            padding
          });
          var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;
          if (referenceRect[len] > popperRect[len]) {
            mainVariationSide = getOppositePlacement(mainVariationSide);
          }
          var altVariationSide = getOppositePlacement(mainVariationSide);
          var checks = [];
          if (checkMainAxis) {
            checks.push(overflow[_basePlacement] <= 0);
          }
          if (checkAltAxis) {
            checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
          }
          if (checks.every(function(check) {
            return check;
          })) {
            firstFittingPlacement = placement;
            makeFallbackChecks = false;
            break;
          }
          checksMap.set(placement, checks);
        }
        if (makeFallbackChecks) {
          var numberOfChecks = flipVariations ? 3 : 1;
          var _loop = function _loop2(_i2) {
            var fittingPlacement = placements2.find(function(placement2) {
              var checks2 = checksMap.get(placement2);
              if (checks2) {
                return checks2.slice(0, _i2).every(function(check) {
                  return check;
                });
              }
            });
            if (fittingPlacement) {
              firstFittingPlacement = fittingPlacement;
              return "break";
            }
          };
          for (var _i = numberOfChecks; _i > 0; _i--) {
            var _ret = _loop(_i);
            if (_ret === "break")
              break;
          }
        }
        if (state.placement !== firstFittingPlacement) {
          state.modifiersData[name]._skip = true;
          state.placement = firstFittingPlacement;
          state.reset = true;
        }
      }
      var flip$1 = {
        name: "flip",
        enabled: true,
        phase: "main",
        fn: flip,
        requiresIfExists: ["offset"],
        data: {
          _skip: false
        }
      };
      function getAltAxis(axis) {
        return axis === "x" ? "y" : "x";
      }
      function within(min$1, value, max$1) {
        return max(min$1, min(value, max$1));
      }
      function withinMaxClamp(min2, value, max2) {
        var v2 = within(min2, value, max2);
        return v2 > max2 ? max2 : v2;
      }
      function preventOverflow(_ref) {
        var state = _ref.state, options = _ref.options, name = _ref.name;
        var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, padding = options.padding, _options$tether = options.tether, tether = _options$tether === void 0 ? true : _options$tether, _options$tetherOffset = options.tetherOffset, tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
        var overflow = detectOverflow(state, {
          boundary,
          rootBoundary,
          padding,
          altBoundary
        });
        var basePlacement = getBasePlacement(state.placement);
        var variation = getVariation(state.placement);
        var isBasePlacement = !variation;
        var mainAxis = getMainAxisFromPlacement(basePlacement);
        var altAxis = getAltAxis(mainAxis);
        var popperOffsets2 = state.modifiersData.popperOffsets;
        var referenceRect = state.rects.reference;
        var popperRect = state.rects.popper;
        var tetherOffsetValue = typeof tetherOffset === "function" ? tetherOffset(Object.assign({}, state.rects, {
          placement: state.placement
        })) : tetherOffset;
        var normalizedTetherOffsetValue = typeof tetherOffsetValue === "number" ? {
          mainAxis: tetherOffsetValue,
          altAxis: tetherOffsetValue
        } : Object.assign({
          mainAxis: 0,
          altAxis: 0
        }, tetherOffsetValue);
        var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
        var data = {
          x: 0,
          y: 0
        };
        if (!popperOffsets2) {
          return;
        }
        if (checkMainAxis) {
          var _offsetModifierState$;
          var mainSide = mainAxis === "y" ? top : left;
          var altSide = mainAxis === "y" ? bottom : right;
          var len = mainAxis === "y" ? "height" : "width";
          var offset2 = popperOffsets2[mainAxis];
          var min$1 = offset2 + overflow[mainSide];
          var max$1 = offset2 - overflow[altSide];
          var additive = tether ? -popperRect[len] / 2 : 0;
          var minLen = variation === start2 ? referenceRect[len] : popperRect[len];
          var maxLen = variation === start2 ? -popperRect[len] : -referenceRect[len];
          var arrowElement = state.elements.arrow;
          var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
            width: 0,
            height: 0
          };
          var arrowPaddingObject = state.modifiersData["arrow#persistent"] ? state.modifiersData["arrow#persistent"].padding : getFreshSideObject();
          var arrowPaddingMin = arrowPaddingObject[mainSide];
          var arrowPaddingMax = arrowPaddingObject[altSide];
          var arrowLen = within(0, referenceRect[len], arrowRect[len]);
          var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
          var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
          var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
          var clientOffset = arrowOffsetParent ? mainAxis === "y" ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
          var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
          var tetherMin = offset2 + minOffset - offsetModifierValue - clientOffset;
          var tetherMax = offset2 + maxOffset - offsetModifierValue;
          var preventedOffset = within(tether ? min(min$1, tetherMin) : min$1, offset2, tether ? max(max$1, tetherMax) : max$1);
          popperOffsets2[mainAxis] = preventedOffset;
          data[mainAxis] = preventedOffset - offset2;
        }
        if (checkAltAxis) {
          var _offsetModifierState$2;
          var _mainSide = mainAxis === "x" ? top : left;
          var _altSide = mainAxis === "x" ? bottom : right;
          var _offset = popperOffsets2[altAxis];
          var _len = altAxis === "y" ? "height" : "width";
          var _min = _offset + overflow[_mainSide];
          var _max = _offset - overflow[_altSide];
          var isOriginSide = [top, left].indexOf(basePlacement) !== -1;
          var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;
          var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;
          var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;
          var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);
          popperOffsets2[altAxis] = _preventedOffset;
          data[altAxis] = _preventedOffset - _offset;
        }
        state.modifiersData[name] = data;
      }
      var preventOverflow$1 = {
        name: "preventOverflow",
        enabled: true,
        phase: "main",
        fn: preventOverflow,
        requiresIfExists: ["offset"]
      };
      var toPaddingObject = function toPaddingObject2(padding, state) {
        padding = typeof padding === "function" ? padding(Object.assign({}, state.rects, {
          placement: state.placement
        })) : padding;
        return mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
      };
      function arrow(_ref) {
        var _state$modifiersData$;
        var state = _ref.state, name = _ref.name, options = _ref.options;
        var arrowElement = state.elements.arrow;
        var popperOffsets2 = state.modifiersData.popperOffsets;
        var basePlacement = getBasePlacement(state.placement);
        var axis = getMainAxisFromPlacement(basePlacement);
        var isVertical = [left, right].indexOf(basePlacement) >= 0;
        var len = isVertical ? "height" : "width";
        if (!arrowElement || !popperOffsets2) {
          return;
        }
        var paddingObject = toPaddingObject(options.padding, state);
        var arrowRect = getLayoutRect(arrowElement);
        var minProp = axis === "y" ? top : left;
        var maxProp = axis === "y" ? bottom : right;
        var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets2[axis] - state.rects.popper[len];
        var startDiff = popperOffsets2[axis] - state.rects.reference[axis];
        var arrowOffsetParent = getOffsetParent(arrowElement);
        var clientSize = arrowOffsetParent ? axis === "y" ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
        var centerToReference = endDiff / 2 - startDiff / 2;
        var min2 = paddingObject[minProp];
        var max2 = clientSize - arrowRect[len] - paddingObject[maxProp];
        var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
        var offset2 = within(min2, center, max2);
        var axisProp = axis;
        state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset2, _state$modifiersData$.centerOffset = offset2 - center, _state$modifiersData$);
      }
      function effect(_ref2) {
        var state = _ref2.state, options = _ref2.options;
        var _options$element = options.element, arrowElement = _options$element === void 0 ? "[data-popper-arrow]" : _options$element;
        if (arrowElement == null) {
          return;
        }
        if (typeof arrowElement === "string") {
          arrowElement = state.elements.popper.querySelector(arrowElement);
          if (!arrowElement) {
            return;
          }
        }
        if (!contains(state.elements.popper, arrowElement)) {
          return;
        }
        state.elements.arrow = arrowElement;
      }
      var arrow$1 = {
        name: "arrow",
        enabled: true,
        phase: "main",
        fn: arrow,
        effect,
        requires: ["popperOffsets"],
        requiresIfExists: ["preventOverflow"]
      };
      function getSideOffsets(overflow, rect, preventedOffsets) {
        if (preventedOffsets === void 0) {
          preventedOffsets = {
            x: 0,
            y: 0
          };
        }
        return {
          top: overflow.top - rect.height - preventedOffsets.y,
          right: overflow.right - rect.width + preventedOffsets.x,
          bottom: overflow.bottom - rect.height + preventedOffsets.y,
          left: overflow.left - rect.width - preventedOffsets.x
        };
      }
      function isAnySideFullyClipped(overflow) {
        return [top, right, bottom, left].some(function(side) {
          return overflow[side] >= 0;
        });
      }
      function hide(_ref) {
        var state = _ref.state, name = _ref.name;
        var referenceRect = state.rects.reference;
        var popperRect = state.rects.popper;
        var preventedOffsets = state.modifiersData.preventOverflow;
        var referenceOverflow = detectOverflow(state, {
          elementContext: "reference"
        });
        var popperAltOverflow = detectOverflow(state, {
          altBoundary: true
        });
        var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
        var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
        var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
        var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
        state.modifiersData[name] = {
          referenceClippingOffsets,
          popperEscapeOffsets,
          isReferenceHidden,
          hasPopperEscaped
        };
        state.attributes.popper = Object.assign({}, state.attributes.popper, {
          "data-popper-reference-hidden": isReferenceHidden,
          "data-popper-escaped": hasPopperEscaped
        });
      }
      var hide$1 = {
        name: "hide",
        enabled: true,
        phase: "main",
        requiresIfExists: ["preventOverflow"],
        fn: hide
      };
      var defaultModifiers$1 = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1];
      var createPopper$1 = /* @__PURE__ */ popperGenerator({
        defaultModifiers: defaultModifiers$1
      });
      var defaultModifiers = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1, offset$1, flip$1, preventOverflow$1, arrow$1, hide$1];
      var createPopper = /* @__PURE__ */ popperGenerator({
        defaultModifiers
      });
      exports.applyStyles = applyStyles$1;
      exports.arrow = arrow$1;
      exports.computeStyles = computeStyles$1;
      exports.createPopper = createPopper;
      exports.createPopperLite = createPopper$1;
      exports.defaultModifiers = defaultModifiers;
      exports.detectOverflow = detectOverflow;
      exports.eventListeners = eventListeners;
      exports.flip = flip$1;
      exports.hide = hide$1;
      exports.offset = offset$1;
      exports.popperGenerator = popperGenerator;
      exports.popperOffsets = popperOffsets$1;
      exports.preventOverflow = preventOverflow$1;
    }
  });

  // node_modules/bootstrap/dist/js/bootstrap.js
  var require_bootstrap = __commonJS({
    "node_modules/bootstrap/dist/js/bootstrap.js"(exports, module) {
      (function(global, factory) {
        typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require_popper()) : typeof define === "function" && define.amd ? define(["@popperjs/core"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.bootstrap = factory(global.Popper));
      })(exports, function(Popper) {
        "use strict";
        function _interopNamespaceDefault(e2) {
          const n2 = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
          if (e2) {
            for (const k2 in e2) {
              if (k2 !== "default") {
                const d2 = Object.getOwnPropertyDescriptor(e2, k2);
                Object.defineProperty(n2, k2, d2.get ? d2 : {
                  enumerable: true,
                  get: () => e2[k2]
                });
              }
            }
          }
          n2.default = e2;
          return Object.freeze(n2);
        }
        const Popper__namespace = /* @__PURE__ */ _interopNamespaceDefault(Popper);
        const elementMap = /* @__PURE__ */ new Map();
        const Data = {
          set(element, key, instance) {
            if (!elementMap.has(element)) {
              elementMap.set(element, /* @__PURE__ */ new Map());
            }
            const instanceMap = elementMap.get(element);
            if (!instanceMap.has(key) && instanceMap.size !== 0) {
              console.error(`Bootstrap doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMap.keys())[0]}.`);
              return;
            }
            instanceMap.set(key, instance);
          },
          get(element, key) {
            if (elementMap.has(element)) {
              return elementMap.get(element).get(key) || null;
            }
            return null;
          },
          remove(element, key) {
            if (!elementMap.has(element)) {
              return;
            }
            const instanceMap = elementMap.get(element);
            instanceMap.delete(key);
            if (instanceMap.size === 0) {
              elementMap.delete(element);
            }
          }
        };
        const MAX_UID = 1e6;
        const MILLISECONDS_MULTIPLIER = 1e3;
        const TRANSITION_END = "transitionend";
        const parseSelector = (selector) => {
          if (selector && window.CSS && window.CSS.escape) {
            selector = selector.replace(/#([^\s"#']+)/g, (match, id) => `#${CSS.escape(id)}`);
          }
          return selector;
        };
        const toType = (object) => {
          if (object === null || object === void 0) {
            return `${object}`;
          }
          return Object.prototype.toString.call(object).match(/\s([a-z]+)/i)[1].toLowerCase();
        };
        const getUID = (prefix) => {
          do {
            prefix += Math.floor(Math.random() * MAX_UID);
          } while (document.getElementById(prefix));
          return prefix;
        };
        const getTransitionDurationFromElement = (element) => {
          if (!element) {
            return 0;
          }
          let {
            transitionDuration,
            transitionDelay
          } = window.getComputedStyle(element);
          const floatTransitionDuration = Number.parseFloat(transitionDuration);
          const floatTransitionDelay = Number.parseFloat(transitionDelay);
          if (!floatTransitionDuration && !floatTransitionDelay) {
            return 0;
          }
          transitionDuration = transitionDuration.split(",")[0];
          transitionDelay = transitionDelay.split(",")[0];
          return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
        };
        const triggerTransitionEnd = (element) => {
          element.dispatchEvent(new Event(TRANSITION_END));
        };
        const isElement = (object) => {
          if (!object || typeof object !== "object") {
            return false;
          }
          if (typeof object.jquery !== "undefined") {
            object = object[0];
          }
          return typeof object.nodeType !== "undefined";
        };
        const getElement = (object) => {
          if (isElement(object)) {
            return object.jquery ? object[0] : object;
          }
          if (typeof object === "string" && object.length > 0) {
            return document.querySelector(parseSelector(object));
          }
          return null;
        };
        const isVisible = (element) => {
          if (!isElement(element) || element.getClientRects().length === 0) {
            return false;
          }
          const elementIsVisible = getComputedStyle(element).getPropertyValue("visibility") === "visible";
          const closedDetails = element.closest("details:not([open])");
          if (!closedDetails) {
            return elementIsVisible;
          }
          if (closedDetails !== element) {
            const summary = element.closest("summary");
            if (summary && summary.parentNode !== closedDetails) {
              return false;
            }
            if (summary === null) {
              return false;
            }
          }
          return elementIsVisible;
        };
        const isDisabled = (element) => {
          if (!element || element.nodeType !== Node.ELEMENT_NODE) {
            return true;
          }
          if (element.classList.contains("disabled")) {
            return true;
          }
          if (typeof element.disabled !== "undefined") {
            return element.disabled;
          }
          return element.hasAttribute("disabled") && element.getAttribute("disabled") !== "false";
        };
        const findShadowRoot = (element) => {
          if (!document.documentElement.attachShadow) {
            return null;
          }
          if (typeof element.getRootNode === "function") {
            const root = element.getRootNode();
            return root instanceof ShadowRoot ? root : null;
          }
          if (element instanceof ShadowRoot) {
            return element;
          }
          if (!element.parentNode) {
            return null;
          }
          return findShadowRoot(element.parentNode);
        };
        const noop = () => {
        };
        const reflow = (element) => {
          element.offsetHeight;
        };
        const getjQuery = () => {
          if (window.jQuery && !document.body.hasAttribute("data-bs-no-jquery")) {
            return window.jQuery;
          }
          return null;
        };
        const DOMContentLoadedCallbacks = [];
        const onDOMContentLoaded = (callback) => {
          if (document.readyState === "loading") {
            if (!DOMContentLoadedCallbacks.length) {
              document.addEventListener("DOMContentLoaded", () => {
                for (const callback2 of DOMContentLoadedCallbacks) {
                  callback2();
                }
              });
            }
            DOMContentLoadedCallbacks.push(callback);
          } else {
            callback();
          }
        };
        const isRTL = () => document.documentElement.dir === "rtl";
        const defineJQueryPlugin = (plugin) => {
          onDOMContentLoaded(() => {
            const $2 = getjQuery();
            if ($2) {
              const name = plugin.NAME;
              const JQUERY_NO_CONFLICT = $2.fn[name];
              $2.fn[name] = plugin.jQueryInterface;
              $2.fn[name].Constructor = plugin;
              $2.fn[name].noConflict = () => {
                $2.fn[name] = JQUERY_NO_CONFLICT;
                return plugin.jQueryInterface;
              };
            }
          });
        };
        const execute = (possibleCallback, args = [], defaultValue = possibleCallback) => {
          return typeof possibleCallback === "function" ? possibleCallback(...args) : defaultValue;
        };
        const executeAfterTransition = (callback, transitionElement, waitForTransition = true) => {
          if (!waitForTransition) {
            execute(callback);
            return;
          }
          const durationPadding = 5;
          const emulatedDuration = getTransitionDurationFromElement(transitionElement) + durationPadding;
          let called = false;
          const handler = ({
            target
          }) => {
            if (target !== transitionElement) {
              return;
            }
            called = true;
            transitionElement.removeEventListener(TRANSITION_END, handler);
            execute(callback);
          };
          transitionElement.addEventListener(TRANSITION_END, handler);
          setTimeout(() => {
            if (!called) {
              triggerTransitionEnd(transitionElement);
            }
          }, emulatedDuration);
        };
        const getNextActiveElement = (list, activeElement, shouldGetNext, isCycleAllowed) => {
          const listLength = list.length;
          let index = list.indexOf(activeElement);
          if (index === -1) {
            return !shouldGetNext && isCycleAllowed ? list[listLength - 1] : list[0];
          }
          index += shouldGetNext ? 1 : -1;
          if (isCycleAllowed) {
            index = (index + listLength) % listLength;
          }
          return list[Math.max(0, Math.min(index, listLength - 1))];
        };
        const namespaceRegex = /[^.]*(?=\..*)\.|.*/;
        const stripNameRegex = /\..*/;
        const stripUidRegex = /::\d+$/;
        const eventRegistry = {};
        let uidEvent = 1;
        const customEvents = {
          mouseenter: "mouseover",
          mouseleave: "mouseout"
        };
        const nativeEvents = /* @__PURE__ */ new Set(["click", "dblclick", "mouseup", "mousedown", "contextmenu", "mousewheel", "DOMMouseScroll", "mouseover", "mouseout", "mousemove", "selectstart", "selectend", "keydown", "keypress", "keyup", "orientationchange", "touchstart", "touchmove", "touchend", "touchcancel", "pointerdown", "pointermove", "pointerup", "pointerleave", "pointercancel", "gesturestart", "gesturechange", "gestureend", "focus", "blur", "change", "reset", "select", "submit", "focusin", "focusout", "load", "unload", "beforeunload", "resize", "move", "DOMContentLoaded", "readystatechange", "error", "abort", "scroll"]);
        function makeEventUid(element, uid) {
          return uid && `${uid}::${uidEvent++}` || element.uidEvent || uidEvent++;
        }
        function getElementEvents(element) {
          const uid = makeEventUid(element);
          element.uidEvent = uid;
          eventRegistry[uid] = eventRegistry[uid] || {};
          return eventRegistry[uid];
        }
        function bootstrapHandler(element, fn) {
          return function handler(event) {
            hydrateObj(event, {
              delegateTarget: element
            });
            if (handler.oneOff) {
              EventHandler.off(element, event.type, fn);
            }
            return fn.apply(element, [event]);
          };
        }
        function bootstrapDelegationHandler(element, selector, fn) {
          return function handler(event) {
            const domElements = element.querySelectorAll(selector);
            for (let {
              target
            } = event; target && target !== this; target = target.parentNode) {
              for (const domElement of domElements) {
                if (domElement !== target) {
                  continue;
                }
                hydrateObj(event, {
                  delegateTarget: target
                });
                if (handler.oneOff) {
                  EventHandler.off(element, event.type, selector, fn);
                }
                return fn.apply(target, [event]);
              }
            }
          };
        }
        function findHandler(events, callable, delegationSelector = null) {
          return Object.values(events).find((event) => event.callable === callable && event.delegationSelector === delegationSelector);
        }
        function normalizeParameters(originalTypeEvent, handler, delegationFunction) {
          const isDelegated = typeof handler === "string";
          const callable = isDelegated ? delegationFunction : handler || delegationFunction;
          let typeEvent = getTypeEvent(originalTypeEvent);
          if (!nativeEvents.has(typeEvent)) {
            typeEvent = originalTypeEvent;
          }
          return [isDelegated, callable, typeEvent];
        }
        function addHandler(element, originalTypeEvent, handler, delegationFunction, oneOff) {
          if (typeof originalTypeEvent !== "string" || !element) {
            return;
          }
          let [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);
          if (originalTypeEvent in customEvents) {
            const wrapFunction = (fn2) => {
              return function(event) {
                if (!event.relatedTarget || event.relatedTarget !== event.delegateTarget && !event.delegateTarget.contains(event.relatedTarget)) {
                  return fn2.call(this, event);
                }
              };
            };
            callable = wrapFunction(callable);
          }
          const events = getElementEvents(element);
          const handlers = events[typeEvent] || (events[typeEvent] = {});
          const previousFunction = findHandler(handlers, callable, isDelegated ? handler : null);
          if (previousFunction) {
            previousFunction.oneOff = previousFunction.oneOff && oneOff;
            return;
          }
          const uid = makeEventUid(callable, originalTypeEvent.replace(namespaceRegex, ""));
          const fn = isDelegated ? bootstrapDelegationHandler(element, handler, callable) : bootstrapHandler(element, callable);
          fn.delegationSelector = isDelegated ? handler : null;
          fn.callable = callable;
          fn.oneOff = oneOff;
          fn.uidEvent = uid;
          handlers[uid] = fn;
          element.addEventListener(typeEvent, fn, isDelegated);
        }
        function removeHandler(element, events, typeEvent, handler, delegationSelector) {
          const fn = findHandler(events[typeEvent], handler, delegationSelector);
          if (!fn) {
            return;
          }
          element.removeEventListener(typeEvent, fn, Boolean(delegationSelector));
          delete events[typeEvent][fn.uidEvent];
        }
        function removeNamespacedHandlers(element, events, typeEvent, namespace) {
          const storeElementEvent = events[typeEvent] || {};
          for (const [handlerKey, event] of Object.entries(storeElementEvent)) {
            if (handlerKey.includes(namespace)) {
              removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
            }
          }
        }
        function getTypeEvent(event) {
          event = event.replace(stripNameRegex, "");
          return customEvents[event] || event;
        }
        const EventHandler = {
          on(element, event, handler, delegationFunction) {
            addHandler(element, event, handler, delegationFunction, false);
          },
          one(element, event, handler, delegationFunction) {
            addHandler(element, event, handler, delegationFunction, true);
          },
          off(element, originalTypeEvent, handler, delegationFunction) {
            if (typeof originalTypeEvent !== "string" || !element) {
              return;
            }
            const [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);
            const inNamespace = typeEvent !== originalTypeEvent;
            const events = getElementEvents(element);
            const storeElementEvent = events[typeEvent] || {};
            const isNamespace = originalTypeEvent.startsWith(".");
            if (typeof callable !== "undefined") {
              if (!Object.keys(storeElementEvent).length) {
                return;
              }
              removeHandler(element, events, typeEvent, callable, isDelegated ? handler : null);
              return;
            }
            if (isNamespace) {
              for (const elementEvent of Object.keys(events)) {
                removeNamespacedHandlers(element, events, elementEvent, originalTypeEvent.slice(1));
              }
            }
            for (const [keyHandlers, event] of Object.entries(storeElementEvent)) {
              const handlerKey = keyHandlers.replace(stripUidRegex, "");
              if (!inNamespace || originalTypeEvent.includes(handlerKey)) {
                removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
              }
            }
          },
          trigger(element, event, args) {
            if (typeof event !== "string" || !element) {
              return null;
            }
            const $2 = getjQuery();
            const typeEvent = getTypeEvent(event);
            const inNamespace = event !== typeEvent;
            let jQueryEvent = null;
            let bubbles = true;
            let nativeDispatch = true;
            let defaultPrevented = false;
            if (inNamespace && $2) {
              jQueryEvent = $2.Event(event, args);
              $2(element).trigger(jQueryEvent);
              bubbles = !jQueryEvent.isPropagationStopped();
              nativeDispatch = !jQueryEvent.isImmediatePropagationStopped();
              defaultPrevented = jQueryEvent.isDefaultPrevented();
            }
            const evt = hydrateObj(new Event(event, {
              bubbles,
              cancelable: true
            }), args);
            if (defaultPrevented) {
              evt.preventDefault();
            }
            if (nativeDispatch) {
              element.dispatchEvent(evt);
            }
            if (evt.defaultPrevented && jQueryEvent) {
              jQueryEvent.preventDefault();
            }
            return evt;
          }
        };
        function hydrateObj(obj, meta = {}) {
          for (const [key, value] of Object.entries(meta)) {
            try {
              obj[key] = value;
            } catch (_unused) {
              Object.defineProperty(obj, key, {
                configurable: true,
                get() {
                  return value;
                }
              });
            }
          }
          return obj;
        }
        function normalizeData(value) {
          if (value === "true") {
            return true;
          }
          if (value === "false") {
            return false;
          }
          if (value === Number(value).toString()) {
            return Number(value);
          }
          if (value === "" || value === "null") {
            return null;
          }
          if (typeof value !== "string") {
            return value;
          }
          try {
            return JSON.parse(decodeURIComponent(value));
          } catch (_unused) {
            return value;
          }
        }
        function normalizeDataKey(key) {
          return key.replace(/[A-Z]/g, (chr) => `-${chr.toLowerCase()}`);
        }
        const Manipulator = {
          setDataAttribute(element, key, value) {
            element.setAttribute(`data-bs-${normalizeDataKey(key)}`, value);
          },
          removeDataAttribute(element, key) {
            element.removeAttribute(`data-bs-${normalizeDataKey(key)}`);
          },
          getDataAttributes(element) {
            if (!element) {
              return {};
            }
            const attributes = {};
            const bsKeys = Object.keys(element.dataset).filter((key) => key.startsWith("bs") && !key.startsWith("bsConfig"));
            for (const key of bsKeys) {
              let pureKey = key.replace(/^bs/, "");
              pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1, pureKey.length);
              attributes[pureKey] = normalizeData(element.dataset[key]);
            }
            return attributes;
          },
          getDataAttribute(element, key) {
            return normalizeData(element.getAttribute(`data-bs-${normalizeDataKey(key)}`));
          }
        };
        class Config {
          // Getters
          static get Default() {
            return {};
          }
          static get DefaultType() {
            return {};
          }
          static get NAME() {
            throw new Error('You have to implement the static method "NAME", for each component!');
          }
          _getConfig(config) {
            config = this._mergeConfigObj(config);
            config = this._configAfterMerge(config);
            this._typeCheckConfig(config);
            return config;
          }
          _configAfterMerge(config) {
            return config;
          }
          _mergeConfigObj(config, element) {
            const jsonConfig = isElement(element) ? Manipulator.getDataAttribute(element, "config") : {};
            return {
              ...this.constructor.Default,
              ...typeof jsonConfig === "object" ? jsonConfig : {},
              ...isElement(element) ? Manipulator.getDataAttributes(element) : {},
              ...typeof config === "object" ? config : {}
            };
          }
          _typeCheckConfig(config, configTypes = this.constructor.DefaultType) {
            for (const [property, expectedTypes] of Object.entries(configTypes)) {
              const value = config[property];
              const valueType = isElement(value) ? "element" : toType(value);
              if (!new RegExp(expectedTypes).test(valueType)) {
                throw new TypeError(`${this.constructor.NAME.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`);
              }
            }
          }
        }
        const VERSION = "5.3.3";
        class BaseComponent extends Config {
          constructor(element, config) {
            super();
            element = getElement(element);
            if (!element) {
              return;
            }
            this._element = element;
            this._config = this._getConfig(config);
            Data.set(this._element, this.constructor.DATA_KEY, this);
          }
          // Public
          dispose() {
            Data.remove(this._element, this.constructor.DATA_KEY);
            EventHandler.off(this._element, this.constructor.EVENT_KEY);
            for (const propertyName of Object.getOwnPropertyNames(this)) {
              this[propertyName] = null;
            }
          }
          _queueCallback(callback, element, isAnimated = true) {
            executeAfterTransition(callback, element, isAnimated);
          }
          _getConfig(config) {
            config = this._mergeConfigObj(config, this._element);
            config = this._configAfterMerge(config);
            this._typeCheckConfig(config);
            return config;
          }
          // Static
          static getInstance(element) {
            return Data.get(getElement(element), this.DATA_KEY);
          }
          static getOrCreateInstance(element, config = {}) {
            return this.getInstance(element) || new this(element, typeof config === "object" ? config : null);
          }
          static get VERSION() {
            return VERSION;
          }
          static get DATA_KEY() {
            return `bs.${this.NAME}`;
          }
          static get EVENT_KEY() {
            return `.${this.DATA_KEY}`;
          }
          static eventName(name) {
            return `${name}${this.EVENT_KEY}`;
          }
        }
        const getSelector = (element) => {
          let selector = element.getAttribute("data-bs-target");
          if (!selector || selector === "#") {
            let hrefAttribute = element.getAttribute("href");
            if (!hrefAttribute || !hrefAttribute.includes("#") && !hrefAttribute.startsWith(".")) {
              return null;
            }
            if (hrefAttribute.includes("#") && !hrefAttribute.startsWith("#")) {
              hrefAttribute = `#${hrefAttribute.split("#")[1]}`;
            }
            selector = hrefAttribute && hrefAttribute !== "#" ? hrefAttribute.trim() : null;
          }
          return selector ? selector.split(",").map((sel) => parseSelector(sel)).join(",") : null;
        };
        const SelectorEngine = {
          find(selector, element = document.documentElement) {
            return [].concat(...Element.prototype.querySelectorAll.call(element, selector));
          },
          findOne(selector, element = document.documentElement) {
            return Element.prototype.querySelector.call(element, selector);
          },
          children(element, selector) {
            return [].concat(...element.children).filter((child) => child.matches(selector));
          },
          parents(element, selector) {
            const parents = [];
            let ancestor = element.parentNode.closest(selector);
            while (ancestor) {
              parents.push(ancestor);
              ancestor = ancestor.parentNode.closest(selector);
            }
            return parents;
          },
          prev(element, selector) {
            let previous = element.previousElementSibling;
            while (previous) {
              if (previous.matches(selector)) {
                return [previous];
              }
              previous = previous.previousElementSibling;
            }
            return [];
          },
          // TODO: this is now unused; remove later along with prev()
          next(element, selector) {
            let next = element.nextElementSibling;
            while (next) {
              if (next.matches(selector)) {
                return [next];
              }
              next = next.nextElementSibling;
            }
            return [];
          },
          focusableChildren(element) {
            const focusables = ["a", "button", "input", "textarea", "select", "details", "[tabindex]", '[contenteditable="true"]'].map((selector) => `${selector}:not([tabindex^="-"])`).join(",");
            return this.find(focusables, element).filter((el) => !isDisabled(el) && isVisible(el));
          },
          getSelectorFromElement(element) {
            const selector = getSelector(element);
            if (selector) {
              return SelectorEngine.findOne(selector) ? selector : null;
            }
            return null;
          },
          getElementFromSelector(element) {
            const selector = getSelector(element);
            return selector ? SelectorEngine.findOne(selector) : null;
          },
          getMultipleElementsFromSelector(element) {
            const selector = getSelector(element);
            return selector ? SelectorEngine.find(selector) : [];
          }
        };
        const enableDismissTrigger = (component, method = "hide") => {
          const clickEvent = `click.dismiss${component.EVENT_KEY}`;
          const name = component.NAME;
          EventHandler.on(document, clickEvent, `[data-bs-dismiss="${name}"]`, function(event) {
            if (["A", "AREA"].includes(this.tagName)) {
              event.preventDefault();
            }
            if (isDisabled(this)) {
              return;
            }
            const target = SelectorEngine.getElementFromSelector(this) || this.closest(`.${name}`);
            const instance = component.getOrCreateInstance(target);
            instance[method]();
          });
        };
        const NAME$f = "alert";
        const DATA_KEY$a = "bs.alert";
        const EVENT_KEY$b = `.${DATA_KEY$a}`;
        const EVENT_CLOSE = `close${EVENT_KEY$b}`;
        const EVENT_CLOSED = `closed${EVENT_KEY$b}`;
        const CLASS_NAME_FADE$5 = "fade";
        const CLASS_NAME_SHOW$8 = "show";
        class Alert extends BaseComponent {
          // Getters
          static get NAME() {
            return NAME$f;
          }
          // Public
          close() {
            const closeEvent = EventHandler.trigger(this._element, EVENT_CLOSE);
            if (closeEvent.defaultPrevented) {
              return;
            }
            this._element.classList.remove(CLASS_NAME_SHOW$8);
            const isAnimated = this._element.classList.contains(CLASS_NAME_FADE$5);
            this._queueCallback(() => this._destroyElement(), this._element, isAnimated);
          }
          // Private
          _destroyElement() {
            this._element.remove();
            EventHandler.trigger(this._element, EVENT_CLOSED);
            this.dispose();
          }
          // Static
          static jQueryInterface(config) {
            return this.each(function() {
              const data = Alert.getOrCreateInstance(this);
              if (typeof config !== "string") {
                return;
              }
              if (data[config] === void 0 || config.startsWith("_") || config === "constructor") {
                throw new TypeError(`No method named "${config}"`);
              }
              data[config](this);
            });
          }
        }
        enableDismissTrigger(Alert, "close");
        defineJQueryPlugin(Alert);
        const NAME$e = "button";
        const DATA_KEY$9 = "bs.button";
        const EVENT_KEY$a = `.${DATA_KEY$9}`;
        const DATA_API_KEY$6 = ".data-api";
        const CLASS_NAME_ACTIVE$3 = "active";
        const SELECTOR_DATA_TOGGLE$5 = '[data-bs-toggle="button"]';
        const EVENT_CLICK_DATA_API$6 = `click${EVENT_KEY$a}${DATA_API_KEY$6}`;
        class Button extends BaseComponent {
          // Getters
          static get NAME() {
            return NAME$e;
          }
          // Public
          toggle() {
            this._element.setAttribute("aria-pressed", this._element.classList.toggle(CLASS_NAME_ACTIVE$3));
          }
          // Static
          static jQueryInterface(config) {
            return this.each(function() {
              const data = Button.getOrCreateInstance(this);
              if (config === "toggle") {
                data[config]();
              }
            });
          }
        }
        EventHandler.on(document, EVENT_CLICK_DATA_API$6, SELECTOR_DATA_TOGGLE$5, (event) => {
          event.preventDefault();
          const button = event.target.closest(SELECTOR_DATA_TOGGLE$5);
          const data = Button.getOrCreateInstance(button);
          data.toggle();
        });
        defineJQueryPlugin(Button);
        const NAME$d = "swipe";
        const EVENT_KEY$9 = ".bs.swipe";
        const EVENT_TOUCHSTART = `touchstart${EVENT_KEY$9}`;
        const EVENT_TOUCHMOVE = `touchmove${EVENT_KEY$9}`;
        const EVENT_TOUCHEND = `touchend${EVENT_KEY$9}`;
        const EVENT_POINTERDOWN = `pointerdown${EVENT_KEY$9}`;
        const EVENT_POINTERUP = `pointerup${EVENT_KEY$9}`;
        const POINTER_TYPE_TOUCH = "touch";
        const POINTER_TYPE_PEN = "pen";
        const CLASS_NAME_POINTER_EVENT = "pointer-event";
        const SWIPE_THRESHOLD = 40;
        const Default$c = {
          endCallback: null,
          leftCallback: null,
          rightCallback: null
        };
        const DefaultType$c = {
          endCallback: "(function|null)",
          leftCallback: "(function|null)",
          rightCallback: "(function|null)"
        };
        class Swipe extends Config {
          constructor(element, config) {
            super();
            this._element = element;
            if (!element || !Swipe.isSupported()) {
              return;
            }
            this._config = this._getConfig(config);
            this._deltaX = 0;
            this._supportPointerEvents = Boolean(window.PointerEvent);
            this._initEvents();
          }
          // Getters
          static get Default() {
            return Default$c;
          }
          static get DefaultType() {
            return DefaultType$c;
          }
          static get NAME() {
            return NAME$d;
          }
          // Public
          dispose() {
            EventHandler.off(this._element, EVENT_KEY$9);
          }
          // Private
          _start(event) {
            if (!this._supportPointerEvents) {
              this._deltaX = event.touches[0].clientX;
              return;
            }
            if (this._eventIsPointerPenTouch(event)) {
              this._deltaX = event.clientX;
            }
          }
          _end(event) {
            if (this._eventIsPointerPenTouch(event)) {
              this._deltaX = event.clientX - this._deltaX;
            }
            this._handleSwipe();
            execute(this._config.endCallback);
          }
          _move(event) {
            this._deltaX = event.touches && event.touches.length > 1 ? 0 : event.touches[0].clientX - this._deltaX;
          }
          _handleSwipe() {
            const absDeltaX = Math.abs(this._deltaX);
            if (absDeltaX <= SWIPE_THRESHOLD) {
              return;
            }
            const direction = absDeltaX / this._deltaX;
            this._deltaX = 0;
            if (!direction) {
              return;
            }
            execute(direction > 0 ? this._config.rightCallback : this._config.leftCallback);
          }
          _initEvents() {
            if (this._supportPointerEvents) {
              EventHandler.on(this._element, EVENT_POINTERDOWN, (event) => this._start(event));
              EventHandler.on(this._element, EVENT_POINTERUP, (event) => this._end(event));
              this._element.classList.add(CLASS_NAME_POINTER_EVENT);
            } else {
              EventHandler.on(this._element, EVENT_TOUCHSTART, (event) => this._start(event));
              EventHandler.on(this._element, EVENT_TOUCHMOVE, (event) => this._move(event));
              EventHandler.on(this._element, EVENT_TOUCHEND, (event) => this._end(event));
            }
          }
          _eventIsPointerPenTouch(event) {
            return this._supportPointerEvents && (event.pointerType === POINTER_TYPE_PEN || event.pointerType === POINTER_TYPE_TOUCH);
          }
          // Static
          static isSupported() {
            return "ontouchstart" in document.documentElement || navigator.maxTouchPoints > 0;
          }
        }
        const NAME$c = "carousel";
        const DATA_KEY$8 = "bs.carousel";
        const EVENT_KEY$8 = `.${DATA_KEY$8}`;
        const DATA_API_KEY$5 = ".data-api";
        const ARROW_LEFT_KEY$1 = "ArrowLeft";
        const ARROW_RIGHT_KEY$1 = "ArrowRight";
        const TOUCHEVENT_COMPAT_WAIT = 500;
        const ORDER_NEXT = "next";
        const ORDER_PREV = "prev";
        const DIRECTION_LEFT = "left";
        const DIRECTION_RIGHT = "right";
        const EVENT_SLIDE = `slide${EVENT_KEY$8}`;
        const EVENT_SLID = `slid${EVENT_KEY$8}`;
        const EVENT_KEYDOWN$1 = `keydown${EVENT_KEY$8}`;
        const EVENT_MOUSEENTER$1 = `mouseenter${EVENT_KEY$8}`;
        const EVENT_MOUSELEAVE$1 = `mouseleave${EVENT_KEY$8}`;
        const EVENT_DRAG_START = `dragstart${EVENT_KEY$8}`;
        const EVENT_LOAD_DATA_API$3 = `load${EVENT_KEY$8}${DATA_API_KEY$5}`;
        const EVENT_CLICK_DATA_API$5 = `click${EVENT_KEY$8}${DATA_API_KEY$5}`;
        const CLASS_NAME_CAROUSEL = "carousel";
        const CLASS_NAME_ACTIVE$2 = "active";
        const CLASS_NAME_SLIDE = "slide";
        const CLASS_NAME_END = "carousel-item-end";
        const CLASS_NAME_START = "carousel-item-start";
        const CLASS_NAME_NEXT = "carousel-item-next";
        const CLASS_NAME_PREV = "carousel-item-prev";
        const SELECTOR_ACTIVE = ".active";
        const SELECTOR_ITEM = ".carousel-item";
        const SELECTOR_ACTIVE_ITEM = SELECTOR_ACTIVE + SELECTOR_ITEM;
        const SELECTOR_ITEM_IMG = ".carousel-item img";
        const SELECTOR_INDICATORS = ".carousel-indicators";
        const SELECTOR_DATA_SLIDE = "[data-bs-slide], [data-bs-slide-to]";
        const SELECTOR_DATA_RIDE = '[data-bs-ride="carousel"]';
        const KEY_TO_DIRECTION = {
          [ARROW_LEFT_KEY$1]: DIRECTION_RIGHT,
          [ARROW_RIGHT_KEY$1]: DIRECTION_LEFT
        };
        const Default$b = {
          interval: 5e3,
          keyboard: true,
          pause: "hover",
          ride: false,
          touch: true,
          wrap: true
        };
        const DefaultType$b = {
          interval: "(number|boolean)",
          // TODO:v6 remove boolean support
          keyboard: "boolean",
          pause: "(string|boolean)",
          ride: "(boolean|string)",
          touch: "boolean",
          wrap: "boolean"
        };
        class Carousel extends BaseComponent {
          constructor(element, config) {
            super(element, config);
            this._interval = null;
            this._activeElement = null;
            this._isSliding = false;
            this.touchTimeout = null;
            this._swipeHelper = null;
            this._indicatorsElement = SelectorEngine.findOne(SELECTOR_INDICATORS, this._element);
            this._addEventListeners();
            if (this._config.ride === CLASS_NAME_CAROUSEL) {
              this.cycle();
            }
          }
          // Getters
          static get Default() {
            return Default$b;
          }
          static get DefaultType() {
            return DefaultType$b;
          }
          static get NAME() {
            return NAME$c;
          }
          // Public
          next() {
            this._slide(ORDER_NEXT);
          }
          nextWhenVisible() {
            if (!document.hidden && isVisible(this._element)) {
              this.next();
            }
          }
          prev() {
            this._slide(ORDER_PREV);
          }
          pause() {
            if (this._isSliding) {
              triggerTransitionEnd(this._element);
            }
            this._clearInterval();
          }
          cycle() {
            this._clearInterval();
            this._updateInterval();
            this._interval = setInterval(() => this.nextWhenVisible(), this._config.interval);
          }
          _maybeEnableCycle() {
            if (!this._config.ride) {
              return;
            }
            if (this._isSliding) {
              EventHandler.one(this._element, EVENT_SLID, () => this.cycle());
              return;
            }
            this.cycle();
          }
          to(index) {
            const items = this._getItems();
            if (index > items.length - 1 || index < 0) {
              return;
            }
            if (this._isSliding) {
              EventHandler.one(this._element, EVENT_SLID, () => this.to(index));
              return;
            }
            const activeIndex = this._getItemIndex(this._getActive());
            if (activeIndex === index) {
              return;
            }
            const order = index > activeIndex ? ORDER_NEXT : ORDER_PREV;
            this._slide(order, items[index]);
          }
          dispose() {
            if (this._swipeHelper) {
              this._swipeHelper.dispose();
            }
            super.dispose();
          }
          // Private
          _configAfterMerge(config) {
            config.defaultInterval = config.interval;
            return config;
          }
          _addEventListeners() {
            if (this._config.keyboard) {
              EventHandler.on(this._element, EVENT_KEYDOWN$1, (event) => this._keydown(event));
            }
            if (this._config.pause === "hover") {
              EventHandler.on(this._element, EVENT_MOUSEENTER$1, () => this.pause());
              EventHandler.on(this._element, EVENT_MOUSELEAVE$1, () => this._maybeEnableCycle());
            }
            if (this._config.touch && Swipe.isSupported()) {
              this._addTouchEventListeners();
            }
          }
          _addTouchEventListeners() {
            for (const img of SelectorEngine.find(SELECTOR_ITEM_IMG, this._element)) {
              EventHandler.on(img, EVENT_DRAG_START, (event) => event.preventDefault());
            }
            const endCallBack = () => {
              if (this._config.pause !== "hover") {
                return;
              }
              this.pause();
              if (this.touchTimeout) {
                clearTimeout(this.touchTimeout);
              }
              this.touchTimeout = setTimeout(() => this._maybeEnableCycle(), TOUCHEVENT_COMPAT_WAIT + this._config.interval);
            };
            const swipeConfig = {
              leftCallback: () => this._slide(this._directionToOrder(DIRECTION_LEFT)),
              rightCallback: () => this._slide(this._directionToOrder(DIRECTION_RIGHT)),
              endCallback: endCallBack
            };
            this._swipeHelper = new Swipe(this._element, swipeConfig);
          }
          _keydown(event) {
            if (/input|textarea/i.test(event.target.tagName)) {
              return;
            }
            const direction = KEY_TO_DIRECTION[event.key];
            if (direction) {
              event.preventDefault();
              this._slide(this._directionToOrder(direction));
            }
          }
          _getItemIndex(element) {
            return this._getItems().indexOf(element);
          }
          _setActiveIndicatorElement(index) {
            if (!this._indicatorsElement) {
              return;
            }
            const activeIndicator = SelectorEngine.findOne(SELECTOR_ACTIVE, this._indicatorsElement);
            activeIndicator.classList.remove(CLASS_NAME_ACTIVE$2);
            activeIndicator.removeAttribute("aria-current");
            const newActiveIndicator = SelectorEngine.findOne(`[data-bs-slide-to="${index}"]`, this._indicatorsElement);
            if (newActiveIndicator) {
              newActiveIndicator.classList.add(CLASS_NAME_ACTIVE$2);
              newActiveIndicator.setAttribute("aria-current", "true");
            }
          }
          _updateInterval() {
            const element = this._activeElement || this._getActive();
            if (!element) {
              return;
            }
            const elementInterval = Number.parseInt(element.getAttribute("data-bs-interval"), 10);
            this._config.interval = elementInterval || this._config.defaultInterval;
          }
          _slide(order, element = null) {
            if (this._isSliding) {
              return;
            }
            const activeElement = this._getActive();
            const isNext = order === ORDER_NEXT;
            const nextElement = element || getNextActiveElement(this._getItems(), activeElement, isNext, this._config.wrap);
            if (nextElement === activeElement) {
              return;
            }
            const nextElementIndex = this._getItemIndex(nextElement);
            const triggerEvent = (eventName) => {
              return EventHandler.trigger(this._element, eventName, {
                relatedTarget: nextElement,
                direction: this._orderToDirection(order),
                from: this._getItemIndex(activeElement),
                to: nextElementIndex
              });
            };
            const slideEvent = triggerEvent(EVENT_SLIDE);
            if (slideEvent.defaultPrevented) {
              return;
            }
            if (!activeElement || !nextElement) {
              return;
            }
            const isCycling = Boolean(this._interval);
            this.pause();
            this._isSliding = true;
            this._setActiveIndicatorElement(nextElementIndex);
            this._activeElement = nextElement;
            const directionalClassName = isNext ? CLASS_NAME_START : CLASS_NAME_END;
            const orderClassName = isNext ? CLASS_NAME_NEXT : CLASS_NAME_PREV;
            nextElement.classList.add(orderClassName);
            reflow(nextElement);
            activeElement.classList.add(directionalClassName);
            nextElement.classList.add(directionalClassName);
            const completeCallBack = () => {
              nextElement.classList.remove(directionalClassName, orderClassName);
              nextElement.classList.add(CLASS_NAME_ACTIVE$2);
              activeElement.classList.remove(CLASS_NAME_ACTIVE$2, orderClassName, directionalClassName);
              this._isSliding = false;
              triggerEvent(EVENT_SLID);
            };
            this._queueCallback(completeCallBack, activeElement, this._isAnimated());
            if (isCycling) {
              this.cycle();
            }
          }
          _isAnimated() {
            return this._element.classList.contains(CLASS_NAME_SLIDE);
          }
          _getActive() {
            return SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element);
          }
          _getItems() {
            return SelectorEngine.find(SELECTOR_ITEM, this._element);
          }
          _clearInterval() {
            if (this._interval) {
              clearInterval(this._interval);
              this._interval = null;
            }
          }
          _directionToOrder(direction) {
            if (isRTL()) {
              return direction === DIRECTION_LEFT ? ORDER_PREV : ORDER_NEXT;
            }
            return direction === DIRECTION_LEFT ? ORDER_NEXT : ORDER_PREV;
          }
          _orderToDirection(order) {
            if (isRTL()) {
              return order === ORDER_PREV ? DIRECTION_LEFT : DIRECTION_RIGHT;
            }
            return order === ORDER_PREV ? DIRECTION_RIGHT : DIRECTION_LEFT;
          }
          // Static
          static jQueryInterface(config) {
            return this.each(function() {
              const data = Carousel.getOrCreateInstance(this, config);
              if (typeof config === "number") {
                data.to(config);
                return;
              }
              if (typeof config === "string") {
                if (data[config] === void 0 || config.startsWith("_") || config === "constructor") {
                  throw new TypeError(`No method named "${config}"`);
                }
                data[config]();
              }
            });
          }
        }
        EventHandler.on(document, EVENT_CLICK_DATA_API$5, SELECTOR_DATA_SLIDE, function(event) {
          const target = SelectorEngine.getElementFromSelector(this);
          if (!target || !target.classList.contains(CLASS_NAME_CAROUSEL)) {
            return;
          }
          event.preventDefault();
          const carousel = Carousel.getOrCreateInstance(target);
          const slideIndex = this.getAttribute("data-bs-slide-to");
          if (slideIndex) {
            carousel.to(slideIndex);
            carousel._maybeEnableCycle();
            return;
          }
          if (Manipulator.getDataAttribute(this, "slide") === "next") {
            carousel.next();
            carousel._maybeEnableCycle();
            return;
          }
          carousel.prev();
          carousel._maybeEnableCycle();
        });
        EventHandler.on(window, EVENT_LOAD_DATA_API$3, () => {
          const carousels = SelectorEngine.find(SELECTOR_DATA_RIDE);
          for (const carousel of carousels) {
            Carousel.getOrCreateInstance(carousel);
          }
        });
        defineJQueryPlugin(Carousel);
        const NAME$b = "collapse";
        const DATA_KEY$7 = "bs.collapse";
        const EVENT_KEY$7 = `.${DATA_KEY$7}`;
        const DATA_API_KEY$4 = ".data-api";
        const EVENT_SHOW$6 = `show${EVENT_KEY$7}`;
        const EVENT_SHOWN$6 = `shown${EVENT_KEY$7}`;
        const EVENT_HIDE$6 = `hide${EVENT_KEY$7}`;
        const EVENT_HIDDEN$6 = `hidden${EVENT_KEY$7}`;
        const EVENT_CLICK_DATA_API$4 = `click${EVENT_KEY$7}${DATA_API_KEY$4}`;
        const CLASS_NAME_SHOW$7 = "show";
        const CLASS_NAME_COLLAPSE = "collapse";
        const CLASS_NAME_COLLAPSING = "collapsing";
        const CLASS_NAME_COLLAPSED = "collapsed";
        const CLASS_NAME_DEEPER_CHILDREN = `:scope .${CLASS_NAME_COLLAPSE} .${CLASS_NAME_COLLAPSE}`;
        const CLASS_NAME_HORIZONTAL = "collapse-horizontal";
        const WIDTH = "width";
        const HEIGHT = "height";
        const SELECTOR_ACTIVES = ".collapse.show, .collapse.collapsing";
        const SELECTOR_DATA_TOGGLE$4 = '[data-bs-toggle="collapse"]';
        const Default$a = {
          parent: null,
          toggle: true
        };
        const DefaultType$a = {
          parent: "(null|element)",
          toggle: "boolean"
        };
        class Collapse extends BaseComponent {
          constructor(element, config) {
            super(element, config);
            this._isTransitioning = false;
            this._triggerArray = [];
            const toggleList = SelectorEngine.find(SELECTOR_DATA_TOGGLE$4);
            for (const elem of toggleList) {
              const selector = SelectorEngine.getSelectorFromElement(elem);
              const filterElement = SelectorEngine.find(selector).filter((foundElement) => foundElement === this._element);
              if (selector !== null && filterElement.length) {
                this._triggerArray.push(elem);
              }
            }
            this._initializeChildren();
            if (!this._config.parent) {
              this._addAriaAndCollapsedClass(this._triggerArray, this._isShown());
            }
            if (this._config.toggle) {
              this.toggle();
            }
          }
          // Getters
          static get Default() {
            return Default$a;
          }
          static get DefaultType() {
            return DefaultType$a;
          }
          static get NAME() {
            return NAME$b;
          }
          // Public
          toggle() {
            if (this._isShown()) {
              this.hide();
            } else {
              this.show();
            }
          }
          show() {
            if (this._isTransitioning || this._isShown()) {
              return;
            }
            let activeChildren = [];
            if (this._config.parent) {
              activeChildren = this._getFirstLevelChildren(SELECTOR_ACTIVES).filter((element) => element !== this._element).map((element) => Collapse.getOrCreateInstance(element, {
                toggle: false
              }));
            }
            if (activeChildren.length && activeChildren[0]._isTransitioning) {
              return;
            }
            const startEvent = EventHandler.trigger(this._element, EVENT_SHOW$6);
            if (startEvent.defaultPrevented) {
              return;
            }
            for (const activeInstance of activeChildren) {
              activeInstance.hide();
            }
            const dimension = this._getDimension();
            this._element.classList.remove(CLASS_NAME_COLLAPSE);
            this._element.classList.add(CLASS_NAME_COLLAPSING);
            this._element.style[dimension] = 0;
            this._addAriaAndCollapsedClass(this._triggerArray, true);
            this._isTransitioning = true;
            const complete = () => {
              this._isTransitioning = false;
              this._element.classList.remove(CLASS_NAME_COLLAPSING);
              this._element.classList.add(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);
              this._element.style[dimension] = "";
              EventHandler.trigger(this._element, EVENT_SHOWN$6);
            };
            const capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
            const scrollSize = `scroll${capitalizedDimension}`;
            this._queueCallback(complete, this._element, true);
            this._element.style[dimension] = `${this._element[scrollSize]}px`;
          }
          hide() {
            if (this._isTransitioning || !this._isShown()) {
              return;
            }
            const startEvent = EventHandler.trigger(this._element, EVENT_HIDE$6);
            if (startEvent.defaultPrevented) {
              return;
            }
            const dimension = this._getDimension();
            this._element.style[dimension] = `${this._element.getBoundingClientRect()[dimension]}px`;
            reflow(this._element);
            this._element.classList.add(CLASS_NAME_COLLAPSING);
            this._element.classList.remove(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);
            for (const trigger of this._triggerArray) {
              const element = SelectorEngine.getElementFromSelector(trigger);
              if (element && !this._isShown(element)) {
                this._addAriaAndCollapsedClass([trigger], false);
              }
            }
            this._isTransitioning = true;
            const complete = () => {
              this._isTransitioning = false;
              this._element.classList.remove(CLASS_NAME_COLLAPSING);
              this._element.classList.add(CLASS_NAME_COLLAPSE);
              EventHandler.trigger(this._element, EVENT_HIDDEN$6);
            };
            this._element.style[dimension] = "";
            this._queueCallback(complete, this._element, true);
          }
          _isShown(element = this._element) {
            return element.classList.contains(CLASS_NAME_SHOW$7);
          }
          // Private
          _configAfterMerge(config) {
            config.toggle = Boolean(config.toggle);
            config.parent = getElement(config.parent);
            return config;
          }
          _getDimension() {
            return this._element.classList.contains(CLASS_NAME_HORIZONTAL) ? WIDTH : HEIGHT;
          }
          _initializeChildren() {
            if (!this._config.parent) {
              return;
            }
            const children = this._getFirstLevelChildren(SELECTOR_DATA_TOGGLE$4);
            for (const element of children) {
              const selected = SelectorEngine.getElementFromSelector(element);
              if (selected) {
                this._addAriaAndCollapsedClass([element], this._isShown(selected));
              }
            }
          }
          _getFirstLevelChildren(selector) {
            const children = SelectorEngine.find(CLASS_NAME_DEEPER_CHILDREN, this._config.parent);
            return SelectorEngine.find(selector, this._config.parent).filter((element) => !children.includes(element));
          }
          _addAriaAndCollapsedClass(triggerArray, isOpen) {
            if (!triggerArray.length) {
              return;
            }
            for (const element of triggerArray) {
              element.classList.toggle(CLASS_NAME_COLLAPSED, !isOpen);
              element.setAttribute("aria-expanded", isOpen);
            }
          }
          // Static
          static jQueryInterface(config) {
            const _config = {};
            if (typeof config === "string" && /show|hide/.test(config)) {
              _config.toggle = false;
            }
            return this.each(function() {
              const data = Collapse.getOrCreateInstance(this, _config);
              if (typeof config === "string") {
                if (typeof data[config] === "undefined") {
                  throw new TypeError(`No method named "${config}"`);
                }
                data[config]();
              }
            });
          }
        }
        EventHandler.on(document, EVENT_CLICK_DATA_API$4, SELECTOR_DATA_TOGGLE$4, function(event) {
          if (event.target.tagName === "A" || event.delegateTarget && event.delegateTarget.tagName === "A") {
            event.preventDefault();
          }
          for (const element of SelectorEngine.getMultipleElementsFromSelector(this)) {
            Collapse.getOrCreateInstance(element, {
              toggle: false
            }).toggle();
          }
        });
        defineJQueryPlugin(Collapse);
        const NAME$a = "dropdown";
        const DATA_KEY$6 = "bs.dropdown";
        const EVENT_KEY$6 = `.${DATA_KEY$6}`;
        const DATA_API_KEY$3 = ".data-api";
        const ESCAPE_KEY$2 = "Escape";
        const TAB_KEY$1 = "Tab";
        const ARROW_UP_KEY$1 = "ArrowUp";
        const ARROW_DOWN_KEY$1 = "ArrowDown";
        const RIGHT_MOUSE_BUTTON = 2;
        const EVENT_HIDE$5 = `hide${EVENT_KEY$6}`;
        const EVENT_HIDDEN$5 = `hidden${EVENT_KEY$6}`;
        const EVENT_SHOW$5 = `show${EVENT_KEY$6}`;
        const EVENT_SHOWN$5 = `shown${EVENT_KEY$6}`;
        const EVENT_CLICK_DATA_API$3 = `click${EVENT_KEY$6}${DATA_API_KEY$3}`;
        const EVENT_KEYDOWN_DATA_API = `keydown${EVENT_KEY$6}${DATA_API_KEY$3}`;
        const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY$6}${DATA_API_KEY$3}`;
        const CLASS_NAME_SHOW$6 = "show";
        const CLASS_NAME_DROPUP = "dropup";
        const CLASS_NAME_DROPEND = "dropend";
        const CLASS_NAME_DROPSTART = "dropstart";
        const CLASS_NAME_DROPUP_CENTER = "dropup-center";
        const CLASS_NAME_DROPDOWN_CENTER = "dropdown-center";
        const SELECTOR_DATA_TOGGLE$3 = '[data-bs-toggle="dropdown"]:not(.disabled):not(:disabled)';
        const SELECTOR_DATA_TOGGLE_SHOWN = `${SELECTOR_DATA_TOGGLE$3}.${CLASS_NAME_SHOW$6}`;
        const SELECTOR_MENU = ".dropdown-menu";
        const SELECTOR_NAVBAR = ".navbar";
        const SELECTOR_NAVBAR_NAV = ".navbar-nav";
        const SELECTOR_VISIBLE_ITEMS = ".dropdown-menu .dropdown-item:not(.disabled):not(:disabled)";
        const PLACEMENT_TOP = isRTL() ? "top-end" : "top-start";
        const PLACEMENT_TOPEND = isRTL() ? "top-start" : "top-end";
        const PLACEMENT_BOTTOM = isRTL() ? "bottom-end" : "bottom-start";
        const PLACEMENT_BOTTOMEND = isRTL() ? "bottom-start" : "bottom-end";
        const PLACEMENT_RIGHT = isRTL() ? "left-start" : "right-start";
        const PLACEMENT_LEFT = isRTL() ? "right-start" : "left-start";
        const PLACEMENT_TOPCENTER = "top";
        const PLACEMENT_BOTTOMCENTER = "bottom";
        const Default$9 = {
          autoClose: true,
          boundary: "clippingParents",
          display: "dynamic",
          offset: [0, 2],
          popperConfig: null,
          reference: "toggle"
        };
        const DefaultType$9 = {
          autoClose: "(boolean|string)",
          boundary: "(string|element)",
          display: "string",
          offset: "(array|string|function)",
          popperConfig: "(null|object|function)",
          reference: "(string|element|object)"
        };
        class Dropdown extends BaseComponent {
          constructor(element, config) {
            super(element, config);
            this._popper = null;
            this._parent = this._element.parentNode;
            this._menu = SelectorEngine.next(this._element, SELECTOR_MENU)[0] || SelectorEngine.prev(this._element, SELECTOR_MENU)[0] || SelectorEngine.findOne(SELECTOR_MENU, this._parent);
            this._inNavbar = this._detectNavbar();
          }
          // Getters
          static get Default() {
            return Default$9;
          }
          static get DefaultType() {
            return DefaultType$9;
          }
          static get NAME() {
            return NAME$a;
          }
          // Public
          toggle() {
            return this._isShown() ? this.hide() : this.show();
          }
          show() {
            if (isDisabled(this._element) || this._isShown()) {
              return;
            }
            const relatedTarget = {
              relatedTarget: this._element
            };
            const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$5, relatedTarget);
            if (showEvent.defaultPrevented) {
              return;
            }
            this._createPopper();
            if ("ontouchstart" in document.documentElement && !this._parent.closest(SELECTOR_NAVBAR_NAV)) {
              for (const element of [].concat(...document.body.children)) {
                EventHandler.on(element, "mouseover", noop);
              }
            }
            this._element.focus();
            this._element.setAttribute("aria-expanded", true);
            this._menu.classList.add(CLASS_NAME_SHOW$6);
            this._element.classList.add(CLASS_NAME_SHOW$6);
            EventHandler.trigger(this._element, EVENT_SHOWN$5, relatedTarget);
          }
          hide() {
            if (isDisabled(this._element) || !this._isShown()) {
              return;
            }
            const relatedTarget = {
              relatedTarget: this._element
            };
            this._completeHide(relatedTarget);
          }
          dispose() {
            if (this._popper) {
              this._popper.destroy();
            }
            super.dispose();
          }
          update() {
            this._inNavbar = this._detectNavbar();
            if (this._popper) {
              this._popper.update();
            }
          }
          // Private
          _completeHide(relatedTarget) {
            const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$5, relatedTarget);
            if (hideEvent.defaultPrevented) {
              return;
            }
            if ("ontouchstart" in document.documentElement) {
              for (const element of [].concat(...document.body.children)) {
                EventHandler.off(element, "mouseover", noop);
              }
            }
            if (this._popper) {
              this._popper.destroy();
            }
            this._menu.classList.remove(CLASS_NAME_SHOW$6);
            this._element.classList.remove(CLASS_NAME_SHOW$6);
            this._element.setAttribute("aria-expanded", "false");
            Manipulator.removeDataAttribute(this._menu, "popper");
            EventHandler.trigger(this._element, EVENT_HIDDEN$5, relatedTarget);
          }
          _getConfig(config) {
            config = super._getConfig(config);
            if (typeof config.reference === "object" && !isElement(config.reference) && typeof config.reference.getBoundingClientRect !== "function") {
              throw new TypeError(`${NAME$a.toUpperCase()}: Option "reference" provided type "object" without a required "getBoundingClientRect" method.`);
            }
            return config;
          }
          _createPopper() {
            if (typeof Popper__namespace === "undefined") {
              throw new TypeError("Bootstrap's dropdowns require Popper (https://popper.js.org)");
            }
            let referenceElement = this._element;
            if (this._config.reference === "parent") {
              referenceElement = this._parent;
            } else if (isElement(this._config.reference)) {
              referenceElement = getElement(this._config.reference);
            } else if (typeof this._config.reference === "object") {
              referenceElement = this._config.reference;
            }
            const popperConfig = this._getPopperConfig();
            this._popper = Popper__namespace.createPopper(referenceElement, this._menu, popperConfig);
          }
          _isShown() {
            return this._menu.classList.contains(CLASS_NAME_SHOW$6);
          }
          _getPlacement() {
            const parentDropdown = this._parent;
            if (parentDropdown.classList.contains(CLASS_NAME_DROPEND)) {
              return PLACEMENT_RIGHT;
            }
            if (parentDropdown.classList.contains(CLASS_NAME_DROPSTART)) {
              return PLACEMENT_LEFT;
            }
            if (parentDropdown.classList.contains(CLASS_NAME_DROPUP_CENTER)) {
              return PLACEMENT_TOPCENTER;
            }
            if (parentDropdown.classList.contains(CLASS_NAME_DROPDOWN_CENTER)) {
              return PLACEMENT_BOTTOMCENTER;
            }
            const isEnd = getComputedStyle(this._menu).getPropertyValue("--bs-position").trim() === "end";
            if (parentDropdown.classList.contains(CLASS_NAME_DROPUP)) {
              return isEnd ? PLACEMENT_TOPEND : PLACEMENT_TOP;
            }
            return isEnd ? PLACEMENT_BOTTOMEND : PLACEMENT_BOTTOM;
          }
          _detectNavbar() {
            return this._element.closest(SELECTOR_NAVBAR) !== null;
          }
          _getOffset() {
            const {
              offset
            } = this._config;
            if (typeof offset === "string") {
              return offset.split(",").map((value) => Number.parseInt(value, 10));
            }
            if (typeof offset === "function") {
              return (popperData) => offset(popperData, this._element);
            }
            return offset;
          }
          _getPopperConfig() {
            const defaultBsPopperConfig = {
              placement: this._getPlacement(),
              modifiers: [{
                name: "preventOverflow",
                options: {
                  boundary: this._config.boundary
                }
              }, {
                name: "offset",
                options: {
                  offset: this._getOffset()
                }
              }]
            };
            if (this._inNavbar || this._config.display === "static") {
              Manipulator.setDataAttribute(this._menu, "popper", "static");
              defaultBsPopperConfig.modifiers = [{
                name: "applyStyles",
                enabled: false
              }];
            }
            return {
              ...defaultBsPopperConfig,
              ...execute(this._config.popperConfig, [defaultBsPopperConfig])
            };
          }
          _selectMenuItem({
            key,
            target
          }) {
            const items = SelectorEngine.find(SELECTOR_VISIBLE_ITEMS, this._menu).filter((element) => isVisible(element));
            if (!items.length) {
              return;
            }
            getNextActiveElement(items, target, key === ARROW_DOWN_KEY$1, !items.includes(target)).focus();
          }
          // Static
          static jQueryInterface(config) {
            return this.each(function() {
              const data = Dropdown.getOrCreateInstance(this, config);
              if (typeof config !== "string") {
                return;
              }
              if (typeof data[config] === "undefined") {
                throw new TypeError(`No method named "${config}"`);
              }
              data[config]();
            });
          }
          static clearMenus(event) {
            if (event.button === RIGHT_MOUSE_BUTTON || event.type === "keyup" && event.key !== TAB_KEY$1) {
              return;
            }
            const openToggles = SelectorEngine.find(SELECTOR_DATA_TOGGLE_SHOWN);
            for (const toggle of openToggles) {
              const context = Dropdown.getInstance(toggle);
              if (!context || context._config.autoClose === false) {
                continue;
              }
              const composedPath = event.composedPath();
              const isMenuTarget = composedPath.includes(context._menu);
              if (composedPath.includes(context._element) || context._config.autoClose === "inside" && !isMenuTarget || context._config.autoClose === "outside" && isMenuTarget) {
                continue;
              }
              if (context._menu.contains(event.target) && (event.type === "keyup" && event.key === TAB_KEY$1 || /input|select|option|textarea|form/i.test(event.target.tagName))) {
                continue;
              }
              const relatedTarget = {
                relatedTarget: context._element
              };
              if (event.type === "click") {
                relatedTarget.clickEvent = event;
              }
              context._completeHide(relatedTarget);
            }
          }
          static dataApiKeydownHandler(event) {
            const isInput = /input|textarea/i.test(event.target.tagName);
            const isEscapeEvent = event.key === ESCAPE_KEY$2;
            const isUpOrDownEvent = [ARROW_UP_KEY$1, ARROW_DOWN_KEY$1].includes(event.key);
            if (!isUpOrDownEvent && !isEscapeEvent) {
              return;
            }
            if (isInput && !isEscapeEvent) {
              return;
            }
            event.preventDefault();
            const getToggleButton = this.matches(SELECTOR_DATA_TOGGLE$3) ? this : SelectorEngine.prev(this, SELECTOR_DATA_TOGGLE$3)[0] || SelectorEngine.next(this, SELECTOR_DATA_TOGGLE$3)[0] || SelectorEngine.findOne(SELECTOR_DATA_TOGGLE$3, event.delegateTarget.parentNode);
            const instance = Dropdown.getOrCreateInstance(getToggleButton);
            if (isUpOrDownEvent) {
              event.stopPropagation();
              instance.show();
              instance._selectMenuItem(event);
              return;
            }
            if (instance._isShown()) {
              event.stopPropagation();
              instance.hide();
              getToggleButton.focus();
            }
          }
        }
        EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_DATA_TOGGLE$3, Dropdown.dataApiKeydownHandler);
        EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_MENU, Dropdown.dataApiKeydownHandler);
        EventHandler.on(document, EVENT_CLICK_DATA_API$3, Dropdown.clearMenus);
        EventHandler.on(document, EVENT_KEYUP_DATA_API, Dropdown.clearMenus);
        EventHandler.on(document, EVENT_CLICK_DATA_API$3, SELECTOR_DATA_TOGGLE$3, function(event) {
          event.preventDefault();
          Dropdown.getOrCreateInstance(this).toggle();
        });
        defineJQueryPlugin(Dropdown);
        const NAME$9 = "backdrop";
        const CLASS_NAME_FADE$4 = "fade";
        const CLASS_NAME_SHOW$5 = "show";
        const EVENT_MOUSEDOWN = `mousedown.bs.${NAME$9}`;
        const Default$8 = {
          className: "modal-backdrop",
          clickCallback: null,
          isAnimated: false,
          isVisible: true,
          // if false, we use the backdrop helper without adding any element to the dom
          rootElement: "body"
          // give the choice to place backdrop under different elements
        };
        const DefaultType$8 = {
          className: "string",
          clickCallback: "(function|null)",
          isAnimated: "boolean",
          isVisible: "boolean",
          rootElement: "(element|string)"
        };
        class Backdrop extends Config {
          constructor(config) {
            super();
            this._config = this._getConfig(config);
            this._isAppended = false;
            this._element = null;
          }
          // Getters
          static get Default() {
            return Default$8;
          }
          static get DefaultType() {
            return DefaultType$8;
          }
          static get NAME() {
            return NAME$9;
          }
          // Public
          show(callback) {
            if (!this._config.isVisible) {
              execute(callback);
              return;
            }
            this._append();
            const element = this._getElement();
            if (this._config.isAnimated) {
              reflow(element);
            }
            element.classList.add(CLASS_NAME_SHOW$5);
            this._emulateAnimation(() => {
              execute(callback);
            });
          }
          hide(callback) {
            if (!this._config.isVisible) {
              execute(callback);
              return;
            }
            this._getElement().classList.remove(CLASS_NAME_SHOW$5);
            this._emulateAnimation(() => {
              this.dispose();
              execute(callback);
            });
          }
          dispose() {
            if (!this._isAppended) {
              return;
            }
            EventHandler.off(this._element, EVENT_MOUSEDOWN);
            this._element.remove();
            this._isAppended = false;
          }
          // Private
          _getElement() {
            if (!this._element) {
              const backdrop = document.createElement("div");
              backdrop.className = this._config.className;
              if (this._config.isAnimated) {
                backdrop.classList.add(CLASS_NAME_FADE$4);
              }
              this._element = backdrop;
            }
            return this._element;
          }
          _configAfterMerge(config) {
            config.rootElement = getElement(config.rootElement);
            return config;
          }
          _append() {
            if (this._isAppended) {
              return;
            }
            const element = this._getElement();
            this._config.rootElement.append(element);
            EventHandler.on(element, EVENT_MOUSEDOWN, () => {
              execute(this._config.clickCallback);
            });
            this._isAppended = true;
          }
          _emulateAnimation(callback) {
            executeAfterTransition(callback, this._getElement(), this._config.isAnimated);
          }
        }
        const NAME$8 = "focustrap";
        const DATA_KEY$5 = "bs.focustrap";
        const EVENT_KEY$5 = `.${DATA_KEY$5}`;
        const EVENT_FOCUSIN$2 = `focusin${EVENT_KEY$5}`;
        const EVENT_KEYDOWN_TAB = `keydown.tab${EVENT_KEY$5}`;
        const TAB_KEY = "Tab";
        const TAB_NAV_FORWARD = "forward";
        const TAB_NAV_BACKWARD = "backward";
        const Default$7 = {
          autofocus: true,
          trapElement: null
          // The element to trap focus inside of
        };
        const DefaultType$7 = {
          autofocus: "boolean",
          trapElement: "element"
        };
        class FocusTrap extends Config {
          constructor(config) {
            super();
            this._config = this._getConfig(config);
            this._isActive = false;
            this._lastTabNavDirection = null;
          }
          // Getters
          static get Default() {
            return Default$7;
          }
          static get DefaultType() {
            return DefaultType$7;
          }
          static get NAME() {
            return NAME$8;
          }
          // Public
          activate() {
            if (this._isActive) {
              return;
            }
            if (this._config.autofocus) {
              this._config.trapElement.focus();
            }
            EventHandler.off(document, EVENT_KEY$5);
            EventHandler.on(document, EVENT_FOCUSIN$2, (event) => this._handleFocusin(event));
            EventHandler.on(document, EVENT_KEYDOWN_TAB, (event) => this._handleKeydown(event));
            this._isActive = true;
          }
          deactivate() {
            if (!this._isActive) {
              return;
            }
            this._isActive = false;
            EventHandler.off(document, EVENT_KEY$5);
          }
          // Private
          _handleFocusin(event) {
            const {
              trapElement
            } = this._config;
            if (event.target === document || event.target === trapElement || trapElement.contains(event.target)) {
              return;
            }
            const elements = SelectorEngine.focusableChildren(trapElement);
            if (elements.length === 0) {
              trapElement.focus();
            } else if (this._lastTabNavDirection === TAB_NAV_BACKWARD) {
              elements[elements.length - 1].focus();
            } else {
              elements[0].focus();
            }
          }
          _handleKeydown(event) {
            if (event.key !== TAB_KEY) {
              return;
            }
            this._lastTabNavDirection = event.shiftKey ? TAB_NAV_BACKWARD : TAB_NAV_FORWARD;
          }
        }
        const SELECTOR_FIXED_CONTENT = ".fixed-top, .fixed-bottom, .is-fixed, .sticky-top";
        const SELECTOR_STICKY_CONTENT = ".sticky-top";
        const PROPERTY_PADDING = "padding-right";
        const PROPERTY_MARGIN = "margin-right";
        class ScrollBarHelper {
          constructor() {
            this._element = document.body;
          }
          // Public
          getWidth() {
            const documentWidth = document.documentElement.clientWidth;
            return Math.abs(window.innerWidth - documentWidth);
          }
          hide() {
            const width = this.getWidth();
            this._disableOverFlow();
            this._setElementAttributes(this._element, PROPERTY_PADDING, (calculatedValue) => calculatedValue + width);
            this._setElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING, (calculatedValue) => calculatedValue + width);
            this._setElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN, (calculatedValue) => calculatedValue - width);
          }
          reset() {
            this._resetElementAttributes(this._element, "overflow");
            this._resetElementAttributes(this._element, PROPERTY_PADDING);
            this._resetElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING);
            this._resetElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN);
          }
          isOverflowing() {
            return this.getWidth() > 0;
          }
          // Private
          _disableOverFlow() {
            this._saveInitialAttribute(this._element, "overflow");
            this._element.style.overflow = "hidden";
          }
          _setElementAttributes(selector, styleProperty, callback) {
            const scrollbarWidth = this.getWidth();
            const manipulationCallBack = (element) => {
              if (element !== this._element && window.innerWidth > element.clientWidth + scrollbarWidth) {
                return;
              }
              this._saveInitialAttribute(element, styleProperty);
              const calculatedValue = window.getComputedStyle(element).getPropertyValue(styleProperty);
              element.style.setProperty(styleProperty, `${callback(Number.parseFloat(calculatedValue))}px`);
            };
            this._applyManipulationCallback(selector, manipulationCallBack);
          }
          _saveInitialAttribute(element, styleProperty) {
            const actualValue = element.style.getPropertyValue(styleProperty);
            if (actualValue) {
              Manipulator.setDataAttribute(element, styleProperty, actualValue);
            }
          }
          _resetElementAttributes(selector, styleProperty) {
            const manipulationCallBack = (element) => {
              const value = Manipulator.getDataAttribute(element, styleProperty);
              if (value === null) {
                element.style.removeProperty(styleProperty);
                return;
              }
              Manipulator.removeDataAttribute(element, styleProperty);
              element.style.setProperty(styleProperty, value);
            };
            this._applyManipulationCallback(selector, manipulationCallBack);
          }
          _applyManipulationCallback(selector, callBack) {
            if (isElement(selector)) {
              callBack(selector);
              return;
            }
            for (const sel of SelectorEngine.find(selector, this._element)) {
              callBack(sel);
            }
          }
        }
        const NAME$7 = "modal";
        const DATA_KEY$4 = "bs.modal";
        const EVENT_KEY$4 = `.${DATA_KEY$4}`;
        const DATA_API_KEY$2 = ".data-api";
        const ESCAPE_KEY$1 = "Escape";
        const EVENT_HIDE$4 = `hide${EVENT_KEY$4}`;
        const EVENT_HIDE_PREVENTED$1 = `hidePrevented${EVENT_KEY$4}`;
        const EVENT_HIDDEN$4 = `hidden${EVENT_KEY$4}`;
        const EVENT_SHOW$4 = `show${EVENT_KEY$4}`;
        const EVENT_SHOWN$4 = `shown${EVENT_KEY$4}`;
        const EVENT_RESIZE$1 = `resize${EVENT_KEY$4}`;
        const EVENT_CLICK_DISMISS = `click.dismiss${EVENT_KEY$4}`;
        const EVENT_MOUSEDOWN_DISMISS = `mousedown.dismiss${EVENT_KEY$4}`;
        const EVENT_KEYDOWN_DISMISS$1 = `keydown.dismiss${EVENT_KEY$4}`;
        const EVENT_CLICK_DATA_API$2 = `click${EVENT_KEY$4}${DATA_API_KEY$2}`;
        const CLASS_NAME_OPEN = "modal-open";
        const CLASS_NAME_FADE$3 = "fade";
        const CLASS_NAME_SHOW$4 = "show";
        const CLASS_NAME_STATIC = "modal-static";
        const OPEN_SELECTOR$1 = ".modal.show";
        const SELECTOR_DIALOG = ".modal-dialog";
        const SELECTOR_MODAL_BODY = ".modal-body";
        const SELECTOR_DATA_TOGGLE$2 = '[data-bs-toggle="modal"]';
        const Default$6 = {
          backdrop: true,
          focus: true,
          keyboard: true
        };
        const DefaultType$6 = {
          backdrop: "(boolean|string)",
          focus: "boolean",
          keyboard: "boolean"
        };
        class Modal extends BaseComponent {
          constructor(element, config) {
            super(element, config);
            this._dialog = SelectorEngine.findOne(SELECTOR_DIALOG, this._element);
            this._backdrop = this._initializeBackDrop();
            this._focustrap = this._initializeFocusTrap();
            this._isShown = false;
            this._isTransitioning = false;
            this._scrollBar = new ScrollBarHelper();
            this._addEventListeners();
          }
          // Getters
          static get Default() {
            return Default$6;
          }
          static get DefaultType() {
            return DefaultType$6;
          }
          static get NAME() {
            return NAME$7;
          }
          // Public
          toggle(relatedTarget) {
            return this._isShown ? this.hide() : this.show(relatedTarget);
          }
          show(relatedTarget) {
            if (this._isShown || this._isTransitioning) {
              return;
            }
            const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$4, {
              relatedTarget
            });
            if (showEvent.defaultPrevented) {
              return;
            }
            this._isShown = true;
            this._isTransitioning = true;
            this._scrollBar.hide();
            document.body.classList.add(CLASS_NAME_OPEN);
            this._adjustDialog();
            this._backdrop.show(() => this._showElement(relatedTarget));
          }
          hide() {
            if (!this._isShown || this._isTransitioning) {
              return;
            }
            const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$4);
            if (hideEvent.defaultPrevented) {
              return;
            }
            this._isShown = false;
            this._isTransitioning = true;
            this._focustrap.deactivate();
            this._element.classList.remove(CLASS_NAME_SHOW$4);
            this._queueCallback(() => this._hideModal(), this._element, this._isAnimated());
          }
          dispose() {
            EventHandler.off(window, EVENT_KEY$4);
            EventHandler.off(this._dialog, EVENT_KEY$4);
            this._backdrop.dispose();
            this._focustrap.deactivate();
            super.dispose();
          }
          handleUpdate() {
            this._adjustDialog();
          }
          // Private
          _initializeBackDrop() {
            return new Backdrop({
              isVisible: Boolean(this._config.backdrop),
              // 'static' option will be translated to true, and booleans will keep their value,
              isAnimated: this._isAnimated()
            });
          }
          _initializeFocusTrap() {
            return new FocusTrap({
              trapElement: this._element
            });
          }
          _showElement(relatedTarget) {
            if (!document.body.contains(this._element)) {
              document.body.append(this._element);
            }
            this._element.style.display = "block";
            this._element.removeAttribute("aria-hidden");
            this._element.setAttribute("aria-modal", true);
            this._element.setAttribute("role", "dialog");
            this._element.scrollTop = 0;
            const modalBody = SelectorEngine.findOne(SELECTOR_MODAL_BODY, this._dialog);
            if (modalBody) {
              modalBody.scrollTop = 0;
            }
            reflow(this._element);
            this._element.classList.add(CLASS_NAME_SHOW$4);
            const transitionComplete = () => {
              if (this._config.focus) {
                this._focustrap.activate();
              }
              this._isTransitioning = false;
              EventHandler.trigger(this._element, EVENT_SHOWN$4, {
                relatedTarget
              });
            };
            this._queueCallback(transitionComplete, this._dialog, this._isAnimated());
          }
          _addEventListeners() {
            EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS$1, (event) => {
              if (event.key !== ESCAPE_KEY$1) {
                return;
              }
              if (this._config.keyboard) {
                this.hide();
                return;
              }
              this._triggerBackdropTransition();
            });
            EventHandler.on(window, EVENT_RESIZE$1, () => {
              if (this._isShown && !this._isTransitioning) {
                this._adjustDialog();
              }
            });
            EventHandler.on(this._element, EVENT_MOUSEDOWN_DISMISS, (event) => {
              EventHandler.one(this._element, EVENT_CLICK_DISMISS, (event2) => {
                if (this._element !== event.target || this._element !== event2.target) {
                  return;
                }
                if (this._config.backdrop === "static") {
                  this._triggerBackdropTransition();
                  return;
                }
                if (this._config.backdrop) {
                  this.hide();
                }
              });
            });
          }
          _hideModal() {
            this._element.style.display = "none";
            this._element.setAttribute("aria-hidden", true);
            this._element.removeAttribute("aria-modal");
            this._element.removeAttribute("role");
            this._isTransitioning = false;
            this._backdrop.hide(() => {
              document.body.classList.remove(CLASS_NAME_OPEN);
              this._resetAdjustments();
              this._scrollBar.reset();
              EventHandler.trigger(this._element, EVENT_HIDDEN$4);
            });
          }
          _isAnimated() {
            return this._element.classList.contains(CLASS_NAME_FADE$3);
          }
          _triggerBackdropTransition() {
            const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED$1);
            if (hideEvent.defaultPrevented) {
              return;
            }
            const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
            const initialOverflowY = this._element.style.overflowY;
            if (initialOverflowY === "hidden" || this._element.classList.contains(CLASS_NAME_STATIC)) {
              return;
            }
            if (!isModalOverflowing) {
              this._element.style.overflowY = "hidden";
            }
            this._element.classList.add(CLASS_NAME_STATIC);
            this._queueCallback(() => {
              this._element.classList.remove(CLASS_NAME_STATIC);
              this._queueCallback(() => {
                this._element.style.overflowY = initialOverflowY;
              }, this._dialog);
            }, this._dialog);
            this._element.focus();
          }
          /**
           * The following methods are used to handle overflowing modals
           */
          _adjustDialog() {
            const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
            const scrollbarWidth = this._scrollBar.getWidth();
            const isBodyOverflowing = scrollbarWidth > 0;
            if (isBodyOverflowing && !isModalOverflowing) {
              const property = isRTL() ? "paddingLeft" : "paddingRight";
              this._element.style[property] = `${scrollbarWidth}px`;
            }
            if (!isBodyOverflowing && isModalOverflowing) {
              const property = isRTL() ? "paddingRight" : "paddingLeft";
              this._element.style[property] = `${scrollbarWidth}px`;
            }
          }
          _resetAdjustments() {
            this._element.style.paddingLeft = "";
            this._element.style.paddingRight = "";
          }
          // Static
          static jQueryInterface(config, relatedTarget) {
            return this.each(function() {
              const data = Modal.getOrCreateInstance(this, config);
              if (typeof config !== "string") {
                return;
              }
              if (typeof data[config] === "undefined") {
                throw new TypeError(`No method named "${config}"`);
              }
              data[config](relatedTarget);
            });
          }
        }
        EventHandler.on(document, EVENT_CLICK_DATA_API$2, SELECTOR_DATA_TOGGLE$2, function(event) {
          const target = SelectorEngine.getElementFromSelector(this);
          if (["A", "AREA"].includes(this.tagName)) {
            event.preventDefault();
          }
          EventHandler.one(target, EVENT_SHOW$4, (showEvent) => {
            if (showEvent.defaultPrevented) {
              return;
            }
            EventHandler.one(target, EVENT_HIDDEN$4, () => {
              if (isVisible(this)) {
                this.focus();
              }
            });
          });
          const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR$1);
          if (alreadyOpen) {
            Modal.getInstance(alreadyOpen).hide();
          }
          const data = Modal.getOrCreateInstance(target);
          data.toggle(this);
        });
        enableDismissTrigger(Modal);
        defineJQueryPlugin(Modal);
        const NAME$6 = "offcanvas";
        const DATA_KEY$3 = "bs.offcanvas";
        const EVENT_KEY$3 = `.${DATA_KEY$3}`;
        const DATA_API_KEY$1 = ".data-api";
        const EVENT_LOAD_DATA_API$2 = `load${EVENT_KEY$3}${DATA_API_KEY$1}`;
        const ESCAPE_KEY = "Escape";
        const CLASS_NAME_SHOW$3 = "show";
        const CLASS_NAME_SHOWING$1 = "showing";
        const CLASS_NAME_HIDING = "hiding";
        const CLASS_NAME_BACKDROP = "offcanvas-backdrop";
        const OPEN_SELECTOR = ".offcanvas.show";
        const EVENT_SHOW$3 = `show${EVENT_KEY$3}`;
        const EVENT_SHOWN$3 = `shown${EVENT_KEY$3}`;
        const EVENT_HIDE$3 = `hide${EVENT_KEY$3}`;
        const EVENT_HIDE_PREVENTED = `hidePrevented${EVENT_KEY$3}`;
        const EVENT_HIDDEN$3 = `hidden${EVENT_KEY$3}`;
        const EVENT_RESIZE = `resize${EVENT_KEY$3}`;
        const EVENT_CLICK_DATA_API$1 = `click${EVENT_KEY$3}${DATA_API_KEY$1}`;
        const EVENT_KEYDOWN_DISMISS = `keydown.dismiss${EVENT_KEY$3}`;
        const SELECTOR_DATA_TOGGLE$1 = '[data-bs-toggle="offcanvas"]';
        const Default$5 = {
          backdrop: true,
          keyboard: true,
          scroll: false
        };
        const DefaultType$5 = {
          backdrop: "(boolean|string)",
          keyboard: "boolean",
          scroll: "boolean"
        };
        class Offcanvas extends BaseComponent {
          constructor(element, config) {
            super(element, config);
            this._isShown = false;
            this._backdrop = this._initializeBackDrop();
            this._focustrap = this._initializeFocusTrap();
            this._addEventListeners();
          }
          // Getters
          static get Default() {
            return Default$5;
          }
          static get DefaultType() {
            return DefaultType$5;
          }
          static get NAME() {
            return NAME$6;
          }
          // Public
          toggle(relatedTarget) {
            return this._isShown ? this.hide() : this.show(relatedTarget);
          }
          show(relatedTarget) {
            if (this._isShown) {
              return;
            }
            const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$3, {
              relatedTarget
            });
            if (showEvent.defaultPrevented) {
              return;
            }
            this._isShown = true;
            this._backdrop.show();
            if (!this._config.scroll) {
              new ScrollBarHelper().hide();
            }
            this._element.setAttribute("aria-modal", true);
            this._element.setAttribute("role", "dialog");
            this._element.classList.add(CLASS_NAME_SHOWING$1);
            const completeCallBack = () => {
              if (!this._config.scroll || this._config.backdrop) {
                this._focustrap.activate();
              }
              this._element.classList.add(CLASS_NAME_SHOW$3);
              this._element.classList.remove(CLASS_NAME_SHOWING$1);
              EventHandler.trigger(this._element, EVENT_SHOWN$3, {
                relatedTarget
              });
            };
            this._queueCallback(completeCallBack, this._element, true);
          }
          hide() {
            if (!this._isShown) {
              return;
            }
            const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$3);
            if (hideEvent.defaultPrevented) {
              return;
            }
            this._focustrap.deactivate();
            this._element.blur();
            this._isShown = false;
            this._element.classList.add(CLASS_NAME_HIDING);
            this._backdrop.hide();
            const completeCallback = () => {
              this._element.classList.remove(CLASS_NAME_SHOW$3, CLASS_NAME_HIDING);
              this._element.removeAttribute("aria-modal");
              this._element.removeAttribute("role");
              if (!this._config.scroll) {
                new ScrollBarHelper().reset();
              }
              EventHandler.trigger(this._element, EVENT_HIDDEN$3);
            };
            this._queueCallback(completeCallback, this._element, true);
          }
          dispose() {
            this._backdrop.dispose();
            this._focustrap.deactivate();
            super.dispose();
          }
          // Private
          _initializeBackDrop() {
            const clickCallback = () => {
              if (this._config.backdrop === "static") {
                EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED);
                return;
              }
              this.hide();
            };
            const isVisible2 = Boolean(this._config.backdrop);
            return new Backdrop({
              className: CLASS_NAME_BACKDROP,
              isVisible: isVisible2,
              isAnimated: true,
              rootElement: this._element.parentNode,
              clickCallback: isVisible2 ? clickCallback : null
            });
          }
          _initializeFocusTrap() {
            return new FocusTrap({
              trapElement: this._element
            });
          }
          _addEventListeners() {
            EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS, (event) => {
              if (event.key !== ESCAPE_KEY) {
                return;
              }
              if (this._config.keyboard) {
                this.hide();
                return;
              }
              EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED);
            });
          }
          // Static
          static jQueryInterface(config) {
            return this.each(function() {
              const data = Offcanvas.getOrCreateInstance(this, config);
              if (typeof config !== "string") {
                return;
              }
              if (data[config] === void 0 || config.startsWith("_") || config === "constructor") {
                throw new TypeError(`No method named "${config}"`);
              }
              data[config](this);
            });
          }
        }
        EventHandler.on(document, EVENT_CLICK_DATA_API$1, SELECTOR_DATA_TOGGLE$1, function(event) {
          const target = SelectorEngine.getElementFromSelector(this);
          if (["A", "AREA"].includes(this.tagName)) {
            event.preventDefault();
          }
          if (isDisabled(this)) {
            return;
          }
          EventHandler.one(target, EVENT_HIDDEN$3, () => {
            if (isVisible(this)) {
              this.focus();
            }
          });
          const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR);
          if (alreadyOpen && alreadyOpen !== target) {
            Offcanvas.getInstance(alreadyOpen).hide();
          }
          const data = Offcanvas.getOrCreateInstance(target);
          data.toggle(this);
        });
        EventHandler.on(window, EVENT_LOAD_DATA_API$2, () => {
          for (const selector of SelectorEngine.find(OPEN_SELECTOR)) {
            Offcanvas.getOrCreateInstance(selector).show();
          }
        });
        EventHandler.on(window, EVENT_RESIZE, () => {
          for (const element of SelectorEngine.find("[aria-modal][class*=show][class*=offcanvas-]")) {
            if (getComputedStyle(element).position !== "fixed") {
              Offcanvas.getOrCreateInstance(element).hide();
            }
          }
        });
        enableDismissTrigger(Offcanvas);
        defineJQueryPlugin(Offcanvas);
        const ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i;
        const DefaultAllowlist = {
          // Global attributes allowed on any supplied element below.
          "*": ["class", "dir", "id", "lang", "role", ARIA_ATTRIBUTE_PATTERN],
          a: ["target", "href", "title", "rel"],
          area: [],
          b: [],
          br: [],
          col: [],
          code: [],
          dd: [],
          div: [],
          dl: [],
          dt: [],
          em: [],
          hr: [],
          h1: [],
          h2: [],
          h3: [],
          h4: [],
          h5: [],
          h6: [],
          i: [],
          img: ["src", "srcset", "alt", "title", "width", "height"],
          li: [],
          ol: [],
          p: [],
          pre: [],
          s: [],
          small: [],
          span: [],
          sub: [],
          sup: [],
          strong: [],
          u: [],
          ul: []
        };
        const uriAttributes = /* @__PURE__ */ new Set(["background", "cite", "href", "itemtype", "longdesc", "poster", "src", "xlink:href"]);
        const SAFE_URL_PATTERN = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:/?#]*(?:[/?#]|$))/i;
        const allowedAttribute = (attribute, allowedAttributeList) => {
          const attributeName = attribute.nodeName.toLowerCase();
          if (allowedAttributeList.includes(attributeName)) {
            if (uriAttributes.has(attributeName)) {
              return Boolean(SAFE_URL_PATTERN.test(attribute.nodeValue));
            }
            return true;
          }
          return allowedAttributeList.filter((attributeRegex) => attributeRegex instanceof RegExp).some((regex) => regex.test(attributeName));
        };
        function sanitizeHtml(unsafeHtml, allowList, sanitizeFunction) {
          if (!unsafeHtml.length) {
            return unsafeHtml;
          }
          if (sanitizeFunction && typeof sanitizeFunction === "function") {
            return sanitizeFunction(unsafeHtml);
          }
          const domParser = new window.DOMParser();
          const createdDocument = domParser.parseFromString(unsafeHtml, "text/html");
          const elements = [].concat(...createdDocument.body.querySelectorAll("*"));
          for (const element of elements) {
            const elementName = element.nodeName.toLowerCase();
            if (!Object.keys(allowList).includes(elementName)) {
              element.remove();
              continue;
            }
            const attributeList = [].concat(...element.attributes);
            const allowedAttributes = [].concat(allowList["*"] || [], allowList[elementName] || []);
            for (const attribute of attributeList) {
              if (!allowedAttribute(attribute, allowedAttributes)) {
                element.removeAttribute(attribute.nodeName);
              }
            }
          }
          return createdDocument.body.innerHTML;
        }
        const NAME$5 = "TemplateFactory";
        const Default$4 = {
          allowList: DefaultAllowlist,
          content: {},
          // { selector : text ,  selector2 : text2 , }
          extraClass: "",
          html: false,
          sanitize: true,
          sanitizeFn: null,
          template: "<div></div>"
        };
        const DefaultType$4 = {
          allowList: "object",
          content: "object",
          extraClass: "(string|function)",
          html: "boolean",
          sanitize: "boolean",
          sanitizeFn: "(null|function)",
          template: "string"
        };
        const DefaultContentType = {
          entry: "(string|element|function|null)",
          selector: "(string|element)"
        };
        class TemplateFactory extends Config {
          constructor(config) {
            super();
            this._config = this._getConfig(config);
          }
          // Getters
          static get Default() {
            return Default$4;
          }
          static get DefaultType() {
            return DefaultType$4;
          }
          static get NAME() {
            return NAME$5;
          }
          // Public
          getContent() {
            return Object.values(this._config.content).map((config) => this._resolvePossibleFunction(config)).filter(Boolean);
          }
          hasContent() {
            return this.getContent().length > 0;
          }
          changeContent(content) {
            this._checkContent(content);
            this._config.content = {
              ...this._config.content,
              ...content
            };
            return this;
          }
          toHtml() {
            const templateWrapper = document.createElement("div");
            templateWrapper.innerHTML = this._maybeSanitize(this._config.template);
            for (const [selector, text] of Object.entries(this._config.content)) {
              this._setContent(templateWrapper, text, selector);
            }
            const template = templateWrapper.children[0];
            const extraClass = this._resolvePossibleFunction(this._config.extraClass);
            if (extraClass) {
              template.classList.add(...extraClass.split(" "));
            }
            return template;
          }
          // Private
          _typeCheckConfig(config) {
            super._typeCheckConfig(config);
            this._checkContent(config.content);
          }
          _checkContent(arg) {
            for (const [selector, content] of Object.entries(arg)) {
              super._typeCheckConfig({
                selector,
                entry: content
              }, DefaultContentType);
            }
          }
          _setContent(template, content, selector) {
            const templateElement = SelectorEngine.findOne(selector, template);
            if (!templateElement) {
              return;
            }
            content = this._resolvePossibleFunction(content);
            if (!content) {
              templateElement.remove();
              return;
            }
            if (isElement(content)) {
              this._putElementInTemplate(getElement(content), templateElement);
              return;
            }
            if (this._config.html) {
              templateElement.innerHTML = this._maybeSanitize(content);
              return;
            }
            templateElement.textContent = content;
          }
          _maybeSanitize(arg) {
            return this._config.sanitize ? sanitizeHtml(arg, this._config.allowList, this._config.sanitizeFn) : arg;
          }
          _resolvePossibleFunction(arg) {
            return execute(arg, [this]);
          }
          _putElementInTemplate(element, templateElement) {
            if (this._config.html) {
              templateElement.innerHTML = "";
              templateElement.append(element);
              return;
            }
            templateElement.textContent = element.textContent;
          }
        }
        const NAME$4 = "tooltip";
        const DISALLOWED_ATTRIBUTES = /* @__PURE__ */ new Set(["sanitize", "allowList", "sanitizeFn"]);
        const CLASS_NAME_FADE$2 = "fade";
        const CLASS_NAME_MODAL = "modal";
        const CLASS_NAME_SHOW$2 = "show";
        const SELECTOR_TOOLTIP_INNER = ".tooltip-inner";
        const SELECTOR_MODAL = `.${CLASS_NAME_MODAL}`;
        const EVENT_MODAL_HIDE = "hide.bs.modal";
        const TRIGGER_HOVER = "hover";
        const TRIGGER_FOCUS = "focus";
        const TRIGGER_CLICK = "click";
        const TRIGGER_MANUAL = "manual";
        const EVENT_HIDE$2 = "hide";
        const EVENT_HIDDEN$2 = "hidden";
        const EVENT_SHOW$2 = "show";
        const EVENT_SHOWN$2 = "shown";
        const EVENT_INSERTED = "inserted";
        const EVENT_CLICK$1 = "click";
        const EVENT_FOCUSIN$1 = "focusin";
        const EVENT_FOCUSOUT$1 = "focusout";
        const EVENT_MOUSEENTER = "mouseenter";
        const EVENT_MOUSELEAVE = "mouseleave";
        const AttachmentMap = {
          AUTO: "auto",
          TOP: "top",
          RIGHT: isRTL() ? "left" : "right",
          BOTTOM: "bottom",
          LEFT: isRTL() ? "right" : "left"
        };
        const Default$3 = {
          allowList: DefaultAllowlist,
          animation: true,
          boundary: "clippingParents",
          container: false,
          customClass: "",
          delay: 0,
          fallbackPlacements: ["top", "right", "bottom", "left"],
          html: false,
          offset: [0, 6],
          placement: "top",
          popperConfig: null,
          sanitize: true,
          sanitizeFn: null,
          selector: false,
          template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
          title: "",
          trigger: "hover focus"
        };
        const DefaultType$3 = {
          allowList: "object",
          animation: "boolean",
          boundary: "(string|element)",
          container: "(string|element|boolean)",
          customClass: "(string|function)",
          delay: "(number|object)",
          fallbackPlacements: "array",
          html: "boolean",
          offset: "(array|string|function)",
          placement: "(string|function)",
          popperConfig: "(null|object|function)",
          sanitize: "boolean",
          sanitizeFn: "(null|function)",
          selector: "(string|boolean)",
          template: "string",
          title: "(string|element|function)",
          trigger: "string"
        };
        class Tooltip extends BaseComponent {
          constructor(element, config) {
            if (typeof Popper__namespace === "undefined") {
              throw new TypeError("Bootstrap's tooltips require Popper (https://popper.js.org)");
            }
            super(element, config);
            this._isEnabled = true;
            this._timeout = 0;
            this._isHovered = null;
            this._activeTrigger = {};
            this._popper = null;
            this._templateFactory = null;
            this._newContent = null;
            this.tip = null;
            this._setListeners();
            if (!this._config.selector) {
              this._fixTitle();
            }
          }
          // Getters
          static get Default() {
            return Default$3;
          }
          static get DefaultType() {
            return DefaultType$3;
          }
          static get NAME() {
            return NAME$4;
          }
          // Public
          enable() {
            this._isEnabled = true;
          }
          disable() {
            this._isEnabled = false;
          }
          toggleEnabled() {
            this._isEnabled = !this._isEnabled;
          }
          toggle() {
            if (!this._isEnabled) {
              return;
            }
            this._activeTrigger.click = !this._activeTrigger.click;
            if (this._isShown()) {
              this._leave();
              return;
            }
            this._enter();
          }
          dispose() {
            clearTimeout(this._timeout);
            EventHandler.off(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
            if (this._element.getAttribute("data-bs-original-title")) {
              this._element.setAttribute("title", this._element.getAttribute("data-bs-original-title"));
            }
            this._disposePopper();
            super.dispose();
          }
          show() {
            if (this._element.style.display === "none") {
              throw new Error("Please use show on visible elements");
            }
            if (!(this._isWithContent() && this._isEnabled)) {
              return;
            }
            const showEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOW$2));
            const shadowRoot = findShadowRoot(this._element);
            const isInTheDom = (shadowRoot || this._element.ownerDocument.documentElement).contains(this._element);
            if (showEvent.defaultPrevented || !isInTheDom) {
              return;
            }
            this._disposePopper();
            const tip = this._getTipElement();
            this._element.setAttribute("aria-describedby", tip.getAttribute("id"));
            const {
              container
            } = this._config;
            if (!this._element.ownerDocument.documentElement.contains(this.tip)) {
              container.append(tip);
              EventHandler.trigger(this._element, this.constructor.eventName(EVENT_INSERTED));
            }
            this._popper = this._createPopper(tip);
            tip.classList.add(CLASS_NAME_SHOW$2);
            if ("ontouchstart" in document.documentElement) {
              for (const element of [].concat(...document.body.children)) {
                EventHandler.on(element, "mouseover", noop);
              }
            }
            const complete = () => {
              EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOWN$2));
              if (this._isHovered === false) {
                this._leave();
              }
              this._isHovered = false;
            };
            this._queueCallback(complete, this.tip, this._isAnimated());
          }
          hide() {
            if (!this._isShown()) {
              return;
            }
            const hideEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDE$2));
            if (hideEvent.defaultPrevented) {
              return;
            }
            const tip = this._getTipElement();
            tip.classList.remove(CLASS_NAME_SHOW$2);
            if ("ontouchstart" in document.documentElement) {
              for (const element of [].concat(...document.body.children)) {
                EventHandler.off(element, "mouseover", noop);
              }
            }
            this._activeTrigger[TRIGGER_CLICK] = false;
            this._activeTrigger[TRIGGER_FOCUS] = false;
            this._activeTrigger[TRIGGER_HOVER] = false;
            this._isHovered = null;
            const complete = () => {
              if (this._isWithActiveTrigger()) {
                return;
              }
              if (!this._isHovered) {
                this._disposePopper();
              }
              this._element.removeAttribute("aria-describedby");
              EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDDEN$2));
            };
            this._queueCallback(complete, this.tip, this._isAnimated());
          }
          update() {
            if (this._popper) {
              this._popper.update();
            }
          }
          // Protected
          _isWithContent() {
            return Boolean(this._getTitle());
          }
          _getTipElement() {
            if (!this.tip) {
              this.tip = this._createTipElement(this._newContent || this._getContentForTemplate());
            }
            return this.tip;
          }
          _createTipElement(content) {
            const tip = this._getTemplateFactory(content).toHtml();
            if (!tip) {
              return null;
            }
            tip.classList.remove(CLASS_NAME_FADE$2, CLASS_NAME_SHOW$2);
            tip.classList.add(`bs-${this.constructor.NAME}-auto`);
            const tipId = getUID(this.constructor.NAME).toString();
            tip.setAttribute("id", tipId);
            if (this._isAnimated()) {
              tip.classList.add(CLASS_NAME_FADE$2);
            }
            return tip;
          }
          setContent(content) {
            this._newContent = content;
            if (this._isShown()) {
              this._disposePopper();
              this.show();
            }
          }
          _getTemplateFactory(content) {
            if (this._templateFactory) {
              this._templateFactory.changeContent(content);
            } else {
              this._templateFactory = new TemplateFactory({
                ...this._config,
                // the `content` var has to be after `this._config`
                // to override config.content in case of popover
                content,
                extraClass: this._resolvePossibleFunction(this._config.customClass)
              });
            }
            return this._templateFactory;
          }
          _getContentForTemplate() {
            return {
              [SELECTOR_TOOLTIP_INNER]: this._getTitle()
            };
          }
          _getTitle() {
            return this._resolvePossibleFunction(this._config.title) || this._element.getAttribute("data-bs-original-title");
          }
          // Private
          _initializeOnDelegatedTarget(event) {
            return this.constructor.getOrCreateInstance(event.delegateTarget, this._getDelegateConfig());
          }
          _isAnimated() {
            return this._config.animation || this.tip && this.tip.classList.contains(CLASS_NAME_FADE$2);
          }
          _isShown() {
            return this.tip && this.tip.classList.contains(CLASS_NAME_SHOW$2);
          }
          _createPopper(tip) {
            const placement = execute(this._config.placement, [this, tip, this._element]);
            const attachment = AttachmentMap[placement.toUpperCase()];
            return Popper__namespace.createPopper(this._element, tip, this._getPopperConfig(attachment));
          }
          _getOffset() {
            const {
              offset
            } = this._config;
            if (typeof offset === "string") {
              return offset.split(",").map((value) => Number.parseInt(value, 10));
            }
            if (typeof offset === "function") {
              return (popperData) => offset(popperData, this._element);
            }
            return offset;
          }
          _resolvePossibleFunction(arg) {
            return execute(arg, [this._element]);
          }
          _getPopperConfig(attachment) {
            const defaultBsPopperConfig = {
              placement: attachment,
              modifiers: [{
                name: "flip",
                options: {
                  fallbackPlacements: this._config.fallbackPlacements
                }
              }, {
                name: "offset",
                options: {
                  offset: this._getOffset()
                }
              }, {
                name: "preventOverflow",
                options: {
                  boundary: this._config.boundary
                }
              }, {
                name: "arrow",
                options: {
                  element: `.${this.constructor.NAME}-arrow`
                }
              }, {
                name: "preSetPlacement",
                enabled: true,
                phase: "beforeMain",
                fn: (data) => {
                  this._getTipElement().setAttribute("data-popper-placement", data.state.placement);
                }
              }]
            };
            return {
              ...defaultBsPopperConfig,
              ...execute(this._config.popperConfig, [defaultBsPopperConfig])
            };
          }
          _setListeners() {
            const triggers = this._config.trigger.split(" ");
            for (const trigger of triggers) {
              if (trigger === "click") {
                EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK$1), this._config.selector, (event) => {
                  const context = this._initializeOnDelegatedTarget(event);
                  context.toggle();
                });
              } else if (trigger !== TRIGGER_MANUAL) {
                const eventIn = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSEENTER) : this.constructor.eventName(EVENT_FOCUSIN$1);
                const eventOut = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSELEAVE) : this.constructor.eventName(EVENT_FOCUSOUT$1);
                EventHandler.on(this._element, eventIn, this._config.selector, (event) => {
                  const context = this._initializeOnDelegatedTarget(event);
                  context._activeTrigger[event.type === "focusin" ? TRIGGER_FOCUS : TRIGGER_HOVER] = true;
                  context._enter();
                });
                EventHandler.on(this._element, eventOut, this._config.selector, (event) => {
                  const context = this._initializeOnDelegatedTarget(event);
                  context._activeTrigger[event.type === "focusout" ? TRIGGER_FOCUS : TRIGGER_HOVER] = context._element.contains(event.relatedTarget);
                  context._leave();
                });
              }
            }
            this._hideModalHandler = () => {
              if (this._element) {
                this.hide();
              }
            };
            EventHandler.on(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
          }
          _fixTitle() {
            const title = this._element.getAttribute("title");
            if (!title) {
              return;
            }
            if (!this._element.getAttribute("aria-label") && !this._element.textContent.trim()) {
              this._element.setAttribute("aria-label", title);
            }
            this._element.setAttribute("data-bs-original-title", title);
            this._element.removeAttribute("title");
          }
          _enter() {
            if (this._isShown() || this._isHovered) {
              this._isHovered = true;
              return;
            }
            this._isHovered = true;
            this._setTimeout(() => {
              if (this._isHovered) {
                this.show();
              }
            }, this._config.delay.show);
          }
          _leave() {
            if (this._isWithActiveTrigger()) {
              return;
            }
            this._isHovered = false;
            this._setTimeout(() => {
              if (!this._isHovered) {
                this.hide();
              }
            }, this._config.delay.hide);
          }
          _setTimeout(handler, timeout) {
            clearTimeout(this._timeout);
            this._timeout = setTimeout(handler, timeout);
          }
          _isWithActiveTrigger() {
            return Object.values(this._activeTrigger).includes(true);
          }
          _getConfig(config) {
            const dataAttributes = Manipulator.getDataAttributes(this._element);
            for (const dataAttribute of Object.keys(dataAttributes)) {
              if (DISALLOWED_ATTRIBUTES.has(dataAttribute)) {
                delete dataAttributes[dataAttribute];
              }
            }
            config = {
              ...dataAttributes,
              ...typeof config === "object" && config ? config : {}
            };
            config = this._mergeConfigObj(config);
            config = this._configAfterMerge(config);
            this._typeCheckConfig(config);
            return config;
          }
          _configAfterMerge(config) {
            config.container = config.container === false ? document.body : getElement(config.container);
            if (typeof config.delay === "number") {
              config.delay = {
                show: config.delay,
                hide: config.delay
              };
            }
            if (typeof config.title === "number") {
              config.title = config.title.toString();
            }
            if (typeof config.content === "number") {
              config.content = config.content.toString();
            }
            return config;
          }
          _getDelegateConfig() {
            const config = {};
            for (const [key, value] of Object.entries(this._config)) {
              if (this.constructor.Default[key] !== value) {
                config[key] = value;
              }
            }
            config.selector = false;
            config.trigger = "manual";
            return config;
          }
          _disposePopper() {
            if (this._popper) {
              this._popper.destroy();
              this._popper = null;
            }
            if (this.tip) {
              this.tip.remove();
              this.tip = null;
            }
          }
          // Static
          static jQueryInterface(config) {
            return this.each(function() {
              const data = Tooltip.getOrCreateInstance(this, config);
              if (typeof config !== "string") {
                return;
              }
              if (typeof data[config] === "undefined") {
                throw new TypeError(`No method named "${config}"`);
              }
              data[config]();
            });
          }
        }
        defineJQueryPlugin(Tooltip);
        const NAME$3 = "popover";
        const SELECTOR_TITLE = ".popover-header";
        const SELECTOR_CONTENT = ".popover-body";
        const Default$2 = {
          ...Tooltip.Default,
          content: "",
          offset: [0, 8],
          placement: "right",
          template: '<div class="popover" role="tooltip"><div class="popover-arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>',
          trigger: "click"
        };
        const DefaultType$2 = {
          ...Tooltip.DefaultType,
          content: "(null|string|element|function)"
        };
        class Popover extends Tooltip {
          // Getters
          static get Default() {
            return Default$2;
          }
          static get DefaultType() {
            return DefaultType$2;
          }
          static get NAME() {
            return NAME$3;
          }
          // Overrides
          _isWithContent() {
            return this._getTitle() || this._getContent();
          }
          // Private
          _getContentForTemplate() {
            return {
              [SELECTOR_TITLE]: this._getTitle(),
              [SELECTOR_CONTENT]: this._getContent()
            };
          }
          _getContent() {
            return this._resolvePossibleFunction(this._config.content);
          }
          // Static
          static jQueryInterface(config) {
            return this.each(function() {
              const data = Popover.getOrCreateInstance(this, config);
              if (typeof config !== "string") {
                return;
              }
              if (typeof data[config] === "undefined") {
                throw new TypeError(`No method named "${config}"`);
              }
              data[config]();
            });
          }
        }
        defineJQueryPlugin(Popover);
        const NAME$2 = "scrollspy";
        const DATA_KEY$2 = "bs.scrollspy";
        const EVENT_KEY$2 = `.${DATA_KEY$2}`;
        const DATA_API_KEY = ".data-api";
        const EVENT_ACTIVATE = `activate${EVENT_KEY$2}`;
        const EVENT_CLICK = `click${EVENT_KEY$2}`;
        const EVENT_LOAD_DATA_API$1 = `load${EVENT_KEY$2}${DATA_API_KEY}`;
        const CLASS_NAME_DROPDOWN_ITEM = "dropdown-item";
        const CLASS_NAME_ACTIVE$1 = "active";
        const SELECTOR_DATA_SPY = '[data-bs-spy="scroll"]';
        const SELECTOR_TARGET_LINKS = "[href]";
        const SELECTOR_NAV_LIST_GROUP = ".nav, .list-group";
        const SELECTOR_NAV_LINKS = ".nav-link";
        const SELECTOR_NAV_ITEMS = ".nav-item";
        const SELECTOR_LIST_ITEMS = ".list-group-item";
        const SELECTOR_LINK_ITEMS = `${SELECTOR_NAV_LINKS}, ${SELECTOR_NAV_ITEMS} > ${SELECTOR_NAV_LINKS}, ${SELECTOR_LIST_ITEMS}`;
        const SELECTOR_DROPDOWN = ".dropdown";
        const SELECTOR_DROPDOWN_TOGGLE$1 = ".dropdown-toggle";
        const Default$1 = {
          offset: null,
          // TODO: v6 @deprecated, keep it for backwards compatibility reasons
          rootMargin: "0px 0px -25%",
          smoothScroll: false,
          target: null,
          threshold: [0.1, 0.5, 1]
        };
        const DefaultType$1 = {
          offset: "(number|null)",
          // TODO v6 @deprecated, keep it for backwards compatibility reasons
          rootMargin: "string",
          smoothScroll: "boolean",
          target: "element",
          threshold: "array"
        };
        class ScrollSpy extends BaseComponent {
          constructor(element, config) {
            super(element, config);
            this._targetLinks = /* @__PURE__ */ new Map();
            this._observableSections = /* @__PURE__ */ new Map();
            this._rootElement = getComputedStyle(this._element).overflowY === "visible" ? null : this._element;
            this._activeTarget = null;
            this._observer = null;
            this._previousScrollData = {
              visibleEntryTop: 0,
              parentScrollTop: 0
            };
            this.refresh();
          }
          // Getters
          static get Default() {
            return Default$1;
          }
          static get DefaultType() {
            return DefaultType$1;
          }
          static get NAME() {
            return NAME$2;
          }
          // Public
          refresh() {
            this._initializeTargetsAndObservables();
            this._maybeEnableSmoothScroll();
            if (this._observer) {
              this._observer.disconnect();
            } else {
              this._observer = this._getNewObserver();
            }
            for (const section of this._observableSections.values()) {
              this._observer.observe(section);
            }
          }
          dispose() {
            this._observer.disconnect();
            super.dispose();
          }
          // Private
          _configAfterMerge(config) {
            config.target = getElement(config.target) || document.body;
            config.rootMargin = config.offset ? `${config.offset}px 0px -30%` : config.rootMargin;
            if (typeof config.threshold === "string") {
              config.threshold = config.threshold.split(",").map((value) => Number.parseFloat(value));
            }
            return config;
          }
          _maybeEnableSmoothScroll() {
            if (!this._config.smoothScroll) {
              return;
            }
            EventHandler.off(this._config.target, EVENT_CLICK);
            EventHandler.on(this._config.target, EVENT_CLICK, SELECTOR_TARGET_LINKS, (event) => {
              const observableSection = this._observableSections.get(event.target.hash);
              if (observableSection) {
                event.preventDefault();
                const root = this._rootElement || window;
                const height = observableSection.offsetTop - this._element.offsetTop;
                if (root.scrollTo) {
                  root.scrollTo({
                    top: height,
                    behavior: "smooth"
                  });
                  return;
                }
                root.scrollTop = height;
              }
            });
          }
          _getNewObserver() {
            const options = {
              root: this._rootElement,
              threshold: this._config.threshold,
              rootMargin: this._config.rootMargin
            };
            return new IntersectionObserver((entries) => this._observerCallback(entries), options);
          }
          // The logic of selection
          _observerCallback(entries) {
            const targetElement = (entry) => this._targetLinks.get(`#${entry.target.id}`);
            const activate = (entry) => {
              this._previousScrollData.visibleEntryTop = entry.target.offsetTop;
              this._process(targetElement(entry));
            };
            const parentScrollTop = (this._rootElement || document.documentElement).scrollTop;
            const userScrollsDown = parentScrollTop >= this._previousScrollData.parentScrollTop;
            this._previousScrollData.parentScrollTop = parentScrollTop;
            for (const entry of entries) {
              if (!entry.isIntersecting) {
                this._activeTarget = null;
                this._clearActiveClass(targetElement(entry));
                continue;
              }
              const entryIsLowerThanPrevious = entry.target.offsetTop >= this._previousScrollData.visibleEntryTop;
              if (userScrollsDown && entryIsLowerThanPrevious) {
                activate(entry);
                if (!parentScrollTop) {
                  return;
                }
                continue;
              }
              if (!userScrollsDown && !entryIsLowerThanPrevious) {
                activate(entry);
              }
            }
          }
          _initializeTargetsAndObservables() {
            this._targetLinks = /* @__PURE__ */ new Map();
            this._observableSections = /* @__PURE__ */ new Map();
            const targetLinks = SelectorEngine.find(SELECTOR_TARGET_LINKS, this._config.target);
            for (const anchor of targetLinks) {
              if (!anchor.hash || isDisabled(anchor)) {
                continue;
              }
              const observableSection = SelectorEngine.findOne(decodeURI(anchor.hash), this._element);
              if (isVisible(observableSection)) {
                this._targetLinks.set(decodeURI(anchor.hash), anchor);
                this._observableSections.set(anchor.hash, observableSection);
              }
            }
          }
          _process(target) {
            if (this._activeTarget === target) {
              return;
            }
            this._clearActiveClass(this._config.target);
            this._activeTarget = target;
            target.classList.add(CLASS_NAME_ACTIVE$1);
            this._activateParents(target);
            EventHandler.trigger(this._element, EVENT_ACTIVATE, {
              relatedTarget: target
            });
          }
          _activateParents(target) {
            if (target.classList.contains(CLASS_NAME_DROPDOWN_ITEM)) {
              SelectorEngine.findOne(SELECTOR_DROPDOWN_TOGGLE$1, target.closest(SELECTOR_DROPDOWN)).classList.add(CLASS_NAME_ACTIVE$1);
              return;
            }
            for (const listGroup of SelectorEngine.parents(target, SELECTOR_NAV_LIST_GROUP)) {
              for (const item of SelectorEngine.prev(listGroup, SELECTOR_LINK_ITEMS)) {
                item.classList.add(CLASS_NAME_ACTIVE$1);
              }
            }
          }
          _clearActiveClass(parent) {
            parent.classList.remove(CLASS_NAME_ACTIVE$1);
            const activeNodes = SelectorEngine.find(`${SELECTOR_TARGET_LINKS}.${CLASS_NAME_ACTIVE$1}`, parent);
            for (const node of activeNodes) {
              node.classList.remove(CLASS_NAME_ACTIVE$1);
            }
          }
          // Static
          static jQueryInterface(config) {
            return this.each(function() {
              const data = ScrollSpy.getOrCreateInstance(this, config);
              if (typeof config !== "string") {
                return;
              }
              if (data[config] === void 0 || config.startsWith("_") || config === "constructor") {
                throw new TypeError(`No method named "${config}"`);
              }
              data[config]();
            });
          }
        }
        EventHandler.on(window, EVENT_LOAD_DATA_API$1, () => {
          for (const spy of SelectorEngine.find(SELECTOR_DATA_SPY)) {
            ScrollSpy.getOrCreateInstance(spy);
          }
        });
        defineJQueryPlugin(ScrollSpy);
        const NAME$1 = "tab";
        const DATA_KEY$1 = "bs.tab";
        const EVENT_KEY$1 = `.${DATA_KEY$1}`;
        const EVENT_HIDE$1 = `hide${EVENT_KEY$1}`;
        const EVENT_HIDDEN$1 = `hidden${EVENT_KEY$1}`;
        const EVENT_SHOW$1 = `show${EVENT_KEY$1}`;
        const EVENT_SHOWN$1 = `shown${EVENT_KEY$1}`;
        const EVENT_CLICK_DATA_API = `click${EVENT_KEY$1}`;
        const EVENT_KEYDOWN = `keydown${EVENT_KEY$1}`;
        const EVENT_LOAD_DATA_API = `load${EVENT_KEY$1}`;
        const ARROW_LEFT_KEY = "ArrowLeft";
        const ARROW_RIGHT_KEY = "ArrowRight";
        const ARROW_UP_KEY = "ArrowUp";
        const ARROW_DOWN_KEY = "ArrowDown";
        const HOME_KEY = "Home";
        const END_KEY = "End";
        const CLASS_NAME_ACTIVE = "active";
        const CLASS_NAME_FADE$1 = "fade";
        const CLASS_NAME_SHOW$1 = "show";
        const CLASS_DROPDOWN = "dropdown";
        const SELECTOR_DROPDOWN_TOGGLE = ".dropdown-toggle";
        const SELECTOR_DROPDOWN_MENU = ".dropdown-menu";
        const NOT_SELECTOR_DROPDOWN_TOGGLE = `:not(${SELECTOR_DROPDOWN_TOGGLE})`;
        const SELECTOR_TAB_PANEL = '.list-group, .nav, [role="tablist"]';
        const SELECTOR_OUTER = ".nav-item, .list-group-item";
        const SELECTOR_INNER = `.nav-link${NOT_SELECTOR_DROPDOWN_TOGGLE}, .list-group-item${NOT_SELECTOR_DROPDOWN_TOGGLE}, [role="tab"]${NOT_SELECTOR_DROPDOWN_TOGGLE}`;
        const SELECTOR_DATA_TOGGLE = '[data-bs-toggle="tab"], [data-bs-toggle="pill"], [data-bs-toggle="list"]';
        const SELECTOR_INNER_ELEM = `${SELECTOR_INNER}, ${SELECTOR_DATA_TOGGLE}`;
        const SELECTOR_DATA_TOGGLE_ACTIVE = `.${CLASS_NAME_ACTIVE}[data-bs-toggle="tab"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="pill"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="list"]`;
        class Tab extends BaseComponent {
          constructor(element) {
            super(element);
            this._parent = this._element.closest(SELECTOR_TAB_PANEL);
            if (!this._parent) {
              return;
            }
            this._setInitialAttributes(this._parent, this._getChildren());
            EventHandler.on(this._element, EVENT_KEYDOWN, (event) => this._keydown(event));
          }
          // Getters
          static get NAME() {
            return NAME$1;
          }
          // Public
          show() {
            const innerElem = this._element;
            if (this._elemIsActive(innerElem)) {
              return;
            }
            const active = this._getActiveElem();
            const hideEvent = active ? EventHandler.trigger(active, EVENT_HIDE$1, {
              relatedTarget: innerElem
            }) : null;
            const showEvent = EventHandler.trigger(innerElem, EVENT_SHOW$1, {
              relatedTarget: active
            });
            if (showEvent.defaultPrevented || hideEvent && hideEvent.defaultPrevented) {
              return;
            }
            this._deactivate(active, innerElem);
            this._activate(innerElem, active);
          }
          // Private
          _activate(element, relatedElem) {
            if (!element) {
              return;
            }
            element.classList.add(CLASS_NAME_ACTIVE);
            this._activate(SelectorEngine.getElementFromSelector(element));
            const complete = () => {
              if (element.getAttribute("role") !== "tab") {
                element.classList.add(CLASS_NAME_SHOW$1);
                return;
              }
              element.removeAttribute("tabindex");
              element.setAttribute("aria-selected", true);
              this._toggleDropDown(element, true);
              EventHandler.trigger(element, EVENT_SHOWN$1, {
                relatedTarget: relatedElem
              });
            };
            this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE$1));
          }
          _deactivate(element, relatedElem) {
            if (!element) {
              return;
            }
            element.classList.remove(CLASS_NAME_ACTIVE);
            element.blur();
            this._deactivate(SelectorEngine.getElementFromSelector(element));
            const complete = () => {
              if (element.getAttribute("role") !== "tab") {
                element.classList.remove(CLASS_NAME_SHOW$1);
                return;
              }
              element.setAttribute("aria-selected", false);
              element.setAttribute("tabindex", "-1");
              this._toggleDropDown(element, false);
              EventHandler.trigger(element, EVENT_HIDDEN$1, {
                relatedTarget: relatedElem
              });
            };
            this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE$1));
          }
          _keydown(event) {
            if (![ARROW_LEFT_KEY, ARROW_RIGHT_KEY, ARROW_UP_KEY, ARROW_DOWN_KEY, HOME_KEY, END_KEY].includes(event.key)) {
              return;
            }
            event.stopPropagation();
            event.preventDefault();
            const children = this._getChildren().filter((element) => !isDisabled(element));
            let nextActiveElement;
            if ([HOME_KEY, END_KEY].includes(event.key)) {
              nextActiveElement = children[event.key === HOME_KEY ? 0 : children.length - 1];
            } else {
              const isNext = [ARROW_RIGHT_KEY, ARROW_DOWN_KEY].includes(event.key);
              nextActiveElement = getNextActiveElement(children, event.target, isNext, true);
            }
            if (nextActiveElement) {
              nextActiveElement.focus({
                preventScroll: true
              });
              Tab.getOrCreateInstance(nextActiveElement).show();
            }
          }
          _getChildren() {
            return SelectorEngine.find(SELECTOR_INNER_ELEM, this._parent);
          }
          _getActiveElem() {
            return this._getChildren().find((child) => this._elemIsActive(child)) || null;
          }
          _setInitialAttributes(parent, children) {
            this._setAttributeIfNotExists(parent, "role", "tablist");
            for (const child of children) {
              this._setInitialAttributesOnChild(child);
            }
          }
          _setInitialAttributesOnChild(child) {
            child = this._getInnerElement(child);
            const isActive = this._elemIsActive(child);
            const outerElem = this._getOuterElement(child);
            child.setAttribute("aria-selected", isActive);
            if (outerElem !== child) {
              this._setAttributeIfNotExists(outerElem, "role", "presentation");
            }
            if (!isActive) {
              child.setAttribute("tabindex", "-1");
            }
            this._setAttributeIfNotExists(child, "role", "tab");
            this._setInitialAttributesOnTargetPanel(child);
          }
          _setInitialAttributesOnTargetPanel(child) {
            const target = SelectorEngine.getElementFromSelector(child);
            if (!target) {
              return;
            }
            this._setAttributeIfNotExists(target, "role", "tabpanel");
            if (child.id) {
              this._setAttributeIfNotExists(target, "aria-labelledby", `${child.id}`);
            }
          }
          _toggleDropDown(element, open) {
            const outerElem = this._getOuterElement(element);
            if (!outerElem.classList.contains(CLASS_DROPDOWN)) {
              return;
            }
            const toggle = (selector, className) => {
              const element2 = SelectorEngine.findOne(selector, outerElem);
              if (element2) {
                element2.classList.toggle(className, open);
              }
            };
            toggle(SELECTOR_DROPDOWN_TOGGLE, CLASS_NAME_ACTIVE);
            toggle(SELECTOR_DROPDOWN_MENU, CLASS_NAME_SHOW$1);
            outerElem.setAttribute("aria-expanded", open);
          }
          _setAttributeIfNotExists(element, attribute, value) {
            if (!element.hasAttribute(attribute)) {
              element.setAttribute(attribute, value);
            }
          }
          _elemIsActive(elem) {
            return elem.classList.contains(CLASS_NAME_ACTIVE);
          }
          // Try to get the inner element (usually the .nav-link)
          _getInnerElement(elem) {
            return elem.matches(SELECTOR_INNER_ELEM) ? elem : SelectorEngine.findOne(SELECTOR_INNER_ELEM, elem);
          }
          // Try to get the outer element (usually the .nav-item)
          _getOuterElement(elem) {
            return elem.closest(SELECTOR_OUTER) || elem;
          }
          // Static
          static jQueryInterface(config) {
            return this.each(function() {
              const data = Tab.getOrCreateInstance(this);
              if (typeof config !== "string") {
                return;
              }
              if (data[config] === void 0 || config.startsWith("_") || config === "constructor") {
                throw new TypeError(`No method named "${config}"`);
              }
              data[config]();
            });
          }
        }
        EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function(event) {
          if (["A", "AREA"].includes(this.tagName)) {
            event.preventDefault();
          }
          if (isDisabled(this)) {
            return;
          }
          Tab.getOrCreateInstance(this).show();
        });
        EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
          for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE_ACTIVE)) {
            Tab.getOrCreateInstance(element);
          }
        });
        defineJQueryPlugin(Tab);
        const NAME = "toast";
        const DATA_KEY = "bs.toast";
        const EVENT_KEY = `.${DATA_KEY}`;
        const EVENT_MOUSEOVER = `mouseover${EVENT_KEY}`;
        const EVENT_MOUSEOUT = `mouseout${EVENT_KEY}`;
        const EVENT_FOCUSIN = `focusin${EVENT_KEY}`;
        const EVENT_FOCUSOUT = `focusout${EVENT_KEY}`;
        const EVENT_HIDE = `hide${EVENT_KEY}`;
        const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
        const EVENT_SHOW = `show${EVENT_KEY}`;
        const EVENT_SHOWN = `shown${EVENT_KEY}`;
        const CLASS_NAME_FADE = "fade";
        const CLASS_NAME_HIDE = "hide";
        const CLASS_NAME_SHOW = "show";
        const CLASS_NAME_SHOWING = "showing";
        const DefaultType = {
          animation: "boolean",
          autohide: "boolean",
          delay: "number"
        };
        const Default = {
          animation: true,
          autohide: true,
          delay: 5e3
        };
        class Toast extends BaseComponent {
          constructor(element, config) {
            super(element, config);
            this._timeout = null;
            this._hasMouseInteraction = false;
            this._hasKeyboardInteraction = false;
            this._setListeners();
          }
          // Getters
          static get Default() {
            return Default;
          }
          static get DefaultType() {
            return DefaultType;
          }
          static get NAME() {
            return NAME;
          }
          // Public
          show() {
            const showEvent = EventHandler.trigger(this._element, EVENT_SHOW);
            if (showEvent.defaultPrevented) {
              return;
            }
            this._clearTimeout();
            if (this._config.animation) {
              this._element.classList.add(CLASS_NAME_FADE);
            }
            const complete = () => {
              this._element.classList.remove(CLASS_NAME_SHOWING);
              EventHandler.trigger(this._element, EVENT_SHOWN);
              this._maybeScheduleHide();
            };
            this._element.classList.remove(CLASS_NAME_HIDE);
            reflow(this._element);
            this._element.classList.add(CLASS_NAME_SHOW, CLASS_NAME_SHOWING);
            this._queueCallback(complete, this._element, this._config.animation);
          }
          hide() {
            if (!this.isShown()) {
              return;
            }
            const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE);
            if (hideEvent.defaultPrevented) {
              return;
            }
            const complete = () => {
              this._element.classList.add(CLASS_NAME_HIDE);
              this._element.classList.remove(CLASS_NAME_SHOWING, CLASS_NAME_SHOW);
              EventHandler.trigger(this._element, EVENT_HIDDEN);
            };
            this._element.classList.add(CLASS_NAME_SHOWING);
            this._queueCallback(complete, this._element, this._config.animation);
          }
          dispose() {
            this._clearTimeout();
            if (this.isShown()) {
              this._element.classList.remove(CLASS_NAME_SHOW);
            }
            super.dispose();
          }
          isShown() {
            return this._element.classList.contains(CLASS_NAME_SHOW);
          }
          // Private
          _maybeScheduleHide() {
            if (!this._config.autohide) {
              return;
            }
            if (this._hasMouseInteraction || this._hasKeyboardInteraction) {
              return;
            }
            this._timeout = setTimeout(() => {
              this.hide();
            }, this._config.delay);
          }
          _onInteraction(event, isInteracting) {
            switch (event.type) {
              case "mouseover":
              case "mouseout": {
                this._hasMouseInteraction = isInteracting;
                break;
              }
              case "focusin":
              case "focusout": {
                this._hasKeyboardInteraction = isInteracting;
                break;
              }
            }
            if (isInteracting) {
              this._clearTimeout();
              return;
            }
            const nextElement = event.relatedTarget;
            if (this._element === nextElement || this._element.contains(nextElement)) {
              return;
            }
            this._maybeScheduleHide();
          }
          _setListeners() {
            EventHandler.on(this._element, EVENT_MOUSEOVER, (event) => this._onInteraction(event, true));
            EventHandler.on(this._element, EVENT_MOUSEOUT, (event) => this._onInteraction(event, false));
            EventHandler.on(this._element, EVENT_FOCUSIN, (event) => this._onInteraction(event, true));
            EventHandler.on(this._element, EVENT_FOCUSOUT, (event) => this._onInteraction(event, false));
          }
          _clearTimeout() {
            clearTimeout(this._timeout);
            this._timeout = null;
          }
          // Static
          static jQueryInterface(config) {
            return this.each(function() {
              const data = Toast.getOrCreateInstance(this, config);
              if (typeof config === "string") {
                if (typeof data[config] === "undefined") {
                  throw new TypeError(`No method named "${config}"`);
                }
                data[config](this);
              }
            });
          }
        }
        enableDismissTrigger(Toast);
        defineJQueryPlugin(Toast);
        const index_umd = {
          Alert,
          Button,
          Carousel,
          Collapse,
          Dropdown,
          Modal,
          Offcanvas,
          Popover,
          ScrollSpy,
          Tab,
          Toast,
          Tooltip
        };
        return index_umd;
      });
    }
  });

  // node_modules/@hotwired/turbo/dist/turbo.es2017-esm.js
  var turbo_es2017_esm_exports = {};
  __export(turbo_es2017_esm_exports, {
    FetchEnctype: () => FetchEnctype,
    FetchMethod: () => FetchMethod,
    FetchRequest: () => FetchRequest,
    FetchResponse: () => FetchResponse,
    FrameElement: () => FrameElement,
    FrameLoadingStyle: () => FrameLoadingStyle,
    FrameRenderer: () => FrameRenderer,
    PageRenderer: () => PageRenderer,
    PageSnapshot: () => PageSnapshot,
    StreamActions: () => StreamActions,
    StreamElement: () => StreamElement,
    StreamSourceElement: () => StreamSourceElement,
    cache: () => cache,
    clearCache: () => clearCache,
    connectStreamSource: () => connectStreamSource,
    disconnectStreamSource: () => disconnectStreamSource,
    fetch: () => fetchWithTurboHeaders,
    fetchEnctypeFromString: () => fetchEnctypeFromString,
    fetchMethodFromString: () => fetchMethodFromString,
    isSafe: () => isSafe,
    navigator: () => navigator$1,
    registerAdapter: () => registerAdapter,
    renderStreamMessage: () => renderStreamMessage,
    session: () => session,
    setConfirmMethod: () => setConfirmMethod,
    setFormMode: () => setFormMode,
    setProgressBarDelay: () => setProgressBarDelay,
    start: () => start,
    visit: () => visit
  });
  (function(prototype) {
    if (typeof prototype.requestSubmit == "function")
      return;
    prototype.requestSubmit = function(submitter) {
      if (submitter) {
        validateSubmitter(submitter, this);
        submitter.click();
      } else {
        submitter = document.createElement("input");
        submitter.type = "submit";
        submitter.hidden = true;
        this.appendChild(submitter);
        submitter.click();
        this.removeChild(submitter);
      }
    };
    function validateSubmitter(submitter, form) {
      submitter instanceof HTMLElement || raise(TypeError, "parameter 1 is not of type 'HTMLElement'");
      submitter.type == "submit" || raise(TypeError, "The specified element is not a submit button");
      submitter.form == form || raise(DOMException, "The specified element is not owned by this form element", "NotFoundError");
    }
    function raise(errorConstructor, message, name) {
      throw new errorConstructor("Failed to execute 'requestSubmit' on 'HTMLFormElement': " + message + ".", name);
    }
  })(HTMLFormElement.prototype);
  var submittersByForm = /* @__PURE__ */ new WeakMap();
  function findSubmitterFromClickTarget(target) {
    const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
    const candidate = element ? element.closest("input, button") : null;
    return candidate?.type == "submit" ? candidate : null;
  }
  function clickCaptured(event) {
    const submitter = findSubmitterFromClickTarget(event.target);
    if (submitter && submitter.form) {
      submittersByForm.set(submitter.form, submitter);
    }
  }
  (function() {
    if ("submitter" in Event.prototype)
      return;
    let prototype = window.Event.prototype;
    if ("SubmitEvent" in window) {
      const prototypeOfSubmitEvent = window.SubmitEvent.prototype;
      if (/Apple Computer/.test(navigator.vendor) && !("submitter" in prototypeOfSubmitEvent)) {
        prototype = prototypeOfSubmitEvent;
      } else {
        return;
      }
    }
    addEventListener("click", clickCaptured, true);
    Object.defineProperty(prototype, "submitter", {
      get() {
        if (this.type == "submit" && this.target instanceof HTMLFormElement) {
          return submittersByForm.get(this.target);
        }
      }
    });
  })();
  var FrameLoadingStyle = {
    eager: "eager",
    lazy: "lazy"
  };
  var FrameElement = class _FrameElement extends HTMLElement {
    static delegateConstructor = void 0;
    loaded = Promise.resolve();
    static get observedAttributes() {
      return ["disabled", "complete", "loading", "src"];
    }
    constructor() {
      super();
      this.delegate = new _FrameElement.delegateConstructor(this);
    }
    connectedCallback() {
      this.delegate.connect();
    }
    disconnectedCallback() {
      this.delegate.disconnect();
    }
    reload() {
      return this.delegate.sourceURLReloaded();
    }
    attributeChangedCallback(name) {
      if (name == "loading") {
        this.delegate.loadingStyleChanged();
      } else if (name == "complete") {
        this.delegate.completeChanged();
      } else if (name == "src") {
        this.delegate.sourceURLChanged();
      } else {
        this.delegate.disabledChanged();
      }
    }
    /**
     * Gets the URL to lazily load source HTML from
     */
    get src() {
      return this.getAttribute("src");
    }
    /**
     * Sets the URL to lazily load source HTML from
     */
    set src(value) {
      if (value) {
        this.setAttribute("src", value);
      } else {
        this.removeAttribute("src");
      }
    }
    /**
     * Gets the refresh mode for the frame.
     */
    get refresh() {
      return this.getAttribute("refresh");
    }
    /**
     * Sets the refresh mode for the frame.
     */
    set refresh(value) {
      if (value) {
        this.setAttribute("refresh", value);
      } else {
        this.removeAttribute("refresh");
      }
    }
    /**
     * Determines if the element is loading
     */
    get loading() {
      return frameLoadingStyleFromString(this.getAttribute("loading") || "");
    }
    /**
     * Sets the value of if the element is loading
     */
    set loading(value) {
      if (value) {
        this.setAttribute("loading", value);
      } else {
        this.removeAttribute("loading");
      }
    }
    /**
     * Gets the disabled state of the frame.
     *
     * If disabled, no requests will be intercepted by the frame.
     */
    get disabled() {
      return this.hasAttribute("disabled");
    }
    /**
     * Sets the disabled state of the frame.
     *
     * If disabled, no requests will be intercepted by the frame.
     */
    set disabled(value) {
      if (value) {
        this.setAttribute("disabled", "");
      } else {
        this.removeAttribute("disabled");
      }
    }
    /**
     * Gets the autoscroll state of the frame.
     *
     * If true, the frame will be scrolled into view automatically on update.
     */
    get autoscroll() {
      return this.hasAttribute("autoscroll");
    }
    /**
     * Sets the autoscroll state of the frame.
     *
     * If true, the frame will be scrolled into view automatically on update.
     */
    set autoscroll(value) {
      if (value) {
        this.setAttribute("autoscroll", "");
      } else {
        this.removeAttribute("autoscroll");
      }
    }
    /**
     * Determines if the element has finished loading
     */
    get complete() {
      return !this.delegate.isLoading;
    }
    /**
     * Gets the active state of the frame.
     *
     * If inactive, source changes will not be observed.
     */
    get isActive() {
      return this.ownerDocument === document && !this.isPreview;
    }
    /**
     * Sets the active state of the frame.
     *
     * If inactive, source changes will not be observed.
     */
    get isPreview() {
      return this.ownerDocument?.documentElement?.hasAttribute("data-turbo-preview");
    }
  };
  function frameLoadingStyleFromString(style) {
    switch (style.toLowerCase()) {
      case "lazy":
        return FrameLoadingStyle.lazy;
      default:
        return FrameLoadingStyle.eager;
    }
  }
  function expandURL(locatable) {
    return new URL(locatable.toString(), document.baseURI);
  }
  function getAnchor(url) {
    let anchorMatch;
    if (url.hash) {
      return url.hash.slice(1);
    } else if (anchorMatch = url.href.match(/#(.*)$/)) {
      return anchorMatch[1];
    }
  }
  function getAction$1(form, submitter) {
    const action = submitter?.getAttribute("formaction") || form.getAttribute("action") || form.action;
    return expandURL(action);
  }
  function getExtension(url) {
    return (getLastPathComponent(url).match(/\.[^.]*$/) || [])[0] || "";
  }
  function isHTML(url) {
    return !!getExtension(url).match(/^(?:|\.(?:htm|html|xhtml|php))$/);
  }
  function isPrefixedBy(baseURL, url) {
    const prefix = getPrefix(url);
    return baseURL.href === expandURL(prefix).href || baseURL.href.startsWith(prefix);
  }
  function locationIsVisitable(location2, rootLocation) {
    return isPrefixedBy(location2, rootLocation) && isHTML(location2);
  }
  function getRequestURL(url) {
    const anchor = getAnchor(url);
    return anchor != null ? url.href.slice(0, -(anchor.length + 1)) : url.href;
  }
  function toCacheKey(url) {
    return getRequestURL(url);
  }
  function urlsAreEqual(left, right) {
    return expandURL(left).href == expandURL(right).href;
  }
  function getPathComponents(url) {
    return url.pathname.split("/").slice(1);
  }
  function getLastPathComponent(url) {
    return getPathComponents(url).slice(-1)[0];
  }
  function getPrefix(url) {
    return addTrailingSlash(url.origin + url.pathname);
  }
  function addTrailingSlash(value) {
    return value.endsWith("/") ? value : value + "/";
  }
  var FetchResponse = class {
    constructor(response) {
      this.response = response;
    }
    get succeeded() {
      return this.response.ok;
    }
    get failed() {
      return !this.succeeded;
    }
    get clientError() {
      return this.statusCode >= 400 && this.statusCode <= 499;
    }
    get serverError() {
      return this.statusCode >= 500 && this.statusCode <= 599;
    }
    get redirected() {
      return this.response.redirected;
    }
    get location() {
      return expandURL(this.response.url);
    }
    get isHTML() {
      return this.contentType && this.contentType.match(/^(?:text\/([^\s;,]+\b)?html|application\/xhtml\+xml)\b/);
    }
    get statusCode() {
      return this.response.status;
    }
    get contentType() {
      return this.header("Content-Type");
    }
    get responseText() {
      return this.response.clone().text();
    }
    get responseHTML() {
      if (this.isHTML) {
        return this.response.clone().text();
      } else {
        return Promise.resolve(void 0);
      }
    }
    header(name) {
      return this.response.headers.get(name);
    }
  };
  function activateScriptElement(element) {
    if (element.getAttribute("data-turbo-eval") == "false") {
      return element;
    } else {
      const createdScriptElement = document.createElement("script");
      const cspNonce = getMetaContent("csp-nonce");
      if (cspNonce) {
        createdScriptElement.nonce = cspNonce;
      }
      createdScriptElement.textContent = element.textContent;
      createdScriptElement.async = false;
      copyElementAttributes(createdScriptElement, element);
      return createdScriptElement;
    }
  }
  function copyElementAttributes(destinationElement, sourceElement) {
    for (const { name, value } of sourceElement.attributes) {
      destinationElement.setAttribute(name, value);
    }
  }
  function createDocumentFragment(html) {
    const template = document.createElement("template");
    template.innerHTML = html;
    return template.content;
  }
  function dispatch(eventName, { target, cancelable, detail } = {}) {
    const event = new CustomEvent(eventName, {
      cancelable,
      bubbles: true,
      composed: true,
      detail
    });
    if (target && target.isConnected) {
      target.dispatchEvent(event);
    } else {
      document.documentElement.dispatchEvent(event);
    }
    return event;
  }
  function nextRepaint() {
    if (document.visibilityState === "hidden") {
      return nextEventLoopTick();
    } else {
      return nextAnimationFrame();
    }
  }
  function nextAnimationFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }
  function nextEventLoopTick() {
    return new Promise((resolve) => setTimeout(() => resolve(), 0));
  }
  function nextMicrotask() {
    return Promise.resolve();
  }
  function parseHTMLDocument(html = "") {
    return new DOMParser().parseFromString(html, "text/html");
  }
  function unindent(strings, ...values) {
    const lines = interpolate(strings, values).replace(/^\n/, "").split("\n");
    const match = lines[0].match(/^\s+/);
    const indent = match ? match[0].length : 0;
    return lines.map((line) => line.slice(indent)).join("\n");
  }
  function interpolate(strings, values) {
    return strings.reduce((result, string, i2) => {
      const value = values[i2] == void 0 ? "" : values[i2];
      return result + string + value;
    }, "");
  }
  function uuid() {
    return Array.from({ length: 36 }).map((_2, i2) => {
      if (i2 == 8 || i2 == 13 || i2 == 18 || i2 == 23) {
        return "-";
      } else if (i2 == 14) {
        return "4";
      } else if (i2 == 19) {
        return (Math.floor(Math.random() * 4) + 8).toString(16);
      } else {
        return Math.floor(Math.random() * 15).toString(16);
      }
    }).join("");
  }
  function getAttribute(attributeName, ...elements) {
    for (const value of elements.map((element) => element?.getAttribute(attributeName))) {
      if (typeof value == "string")
        return value;
    }
    return null;
  }
  function hasAttribute(attributeName, ...elements) {
    return elements.some((element) => element && element.hasAttribute(attributeName));
  }
  function markAsBusy(...elements) {
    for (const element of elements) {
      if (element.localName == "turbo-frame") {
        element.setAttribute("busy", "");
      }
      element.setAttribute("aria-busy", "true");
    }
  }
  function clearBusyState(...elements) {
    for (const element of elements) {
      if (element.localName == "turbo-frame") {
        element.removeAttribute("busy");
      }
      element.removeAttribute("aria-busy");
    }
  }
  function waitForLoad(element, timeoutInMilliseconds = 2e3) {
    return new Promise((resolve) => {
      const onComplete = () => {
        element.removeEventListener("error", onComplete);
        element.removeEventListener("load", onComplete);
        resolve();
      };
      element.addEventListener("load", onComplete, { once: true });
      element.addEventListener("error", onComplete, { once: true });
      setTimeout(resolve, timeoutInMilliseconds);
    });
  }
  function getHistoryMethodForAction(action) {
    switch (action) {
      case "replace":
        return history.replaceState;
      case "advance":
      case "restore":
        return history.pushState;
    }
  }
  function isAction(action) {
    return action == "advance" || action == "replace" || action == "restore";
  }
  function getVisitAction(...elements) {
    const action = getAttribute("data-turbo-action", ...elements);
    return isAction(action) ? action : null;
  }
  function getMetaElement(name) {
    return document.querySelector(`meta[name="${name}"]`);
  }
  function getMetaContent(name) {
    const element = getMetaElement(name);
    return element && element.content;
  }
  function setMetaContent(name, content) {
    let element = getMetaElement(name);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute("name", name);
      document.head.appendChild(element);
    }
    element.setAttribute("content", content);
    return element;
  }
  function findClosestRecursively(element, selector) {
    if (element instanceof Element) {
      return element.closest(selector) || findClosestRecursively(element.assignedSlot || element.getRootNode()?.host, selector);
    }
  }
  function elementIsFocusable(element) {
    const inertDisabledOrHidden = "[inert], :disabled, [hidden], details:not([open]), dialog:not([open])";
    return !!element && element.closest(inertDisabledOrHidden) == null && typeof element.focus == "function";
  }
  function queryAutofocusableElement(elementOrDocumentFragment) {
    return Array.from(elementOrDocumentFragment.querySelectorAll("[autofocus]")).find(elementIsFocusable);
  }
  async function around(callback, reader) {
    const before = reader();
    callback();
    await nextAnimationFrame();
    const after = reader();
    return [before, after];
  }
  function doesNotTargetIFrame(anchor) {
    if (anchor.hasAttribute("target")) {
      for (const element of document.getElementsByName(anchor.target)) {
        if (element instanceof HTMLIFrameElement)
          return false;
      }
    }
    return true;
  }
  function findLinkFromClickTarget(target) {
    return findClosestRecursively(target, "a[href]:not([target^=_]):not([download])");
  }
  function getLocationForLink(link) {
    return expandURL(link.getAttribute("href") || "");
  }
  function debounce(fn, delay) {
    let timeoutId = null;
    return (...args) => {
      const callback = () => fn.apply(this, args);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(callback, delay);
    };
  }
  var LimitedSet = class extends Set {
    constructor(maxSize) {
      super();
      this.maxSize = maxSize;
    }
    add(value) {
      if (this.size >= this.maxSize) {
        const iterator = this.values();
        const oldestValue = iterator.next().value;
        this.delete(oldestValue);
      }
      super.add(value);
    }
  };
  var recentRequests = new LimitedSet(20);
  var nativeFetch = window.fetch;
  function fetchWithTurboHeaders(url, options = {}) {
    const modifiedHeaders = new Headers(options.headers || {});
    const requestUID = uuid();
    recentRequests.add(requestUID);
    modifiedHeaders.append("X-Turbo-Request-Id", requestUID);
    return nativeFetch(url, {
      ...options,
      headers: modifiedHeaders
    });
  }
  function fetchMethodFromString(method) {
    switch (method.toLowerCase()) {
      case "get":
        return FetchMethod.get;
      case "post":
        return FetchMethod.post;
      case "put":
        return FetchMethod.put;
      case "patch":
        return FetchMethod.patch;
      case "delete":
        return FetchMethod.delete;
    }
  }
  var FetchMethod = {
    get: "get",
    post: "post",
    put: "put",
    patch: "patch",
    delete: "delete"
  };
  function fetchEnctypeFromString(encoding) {
    switch (encoding.toLowerCase()) {
      case FetchEnctype.multipart:
        return FetchEnctype.multipart;
      case FetchEnctype.plain:
        return FetchEnctype.plain;
      default:
        return FetchEnctype.urlEncoded;
    }
  }
  var FetchEnctype = {
    urlEncoded: "application/x-www-form-urlencoded",
    multipart: "multipart/form-data",
    plain: "text/plain"
  };
  var FetchRequest = class {
    abortController = new AbortController();
    #resolveRequestPromise = (_value) => {
    };
    constructor(delegate, method, location2, requestBody = new URLSearchParams(), target = null, enctype = FetchEnctype.urlEncoded) {
      const [url, body] = buildResourceAndBody(expandURL(location2), method, requestBody, enctype);
      this.delegate = delegate;
      this.url = url;
      this.target = target;
      this.fetchOptions = {
        credentials: "same-origin",
        redirect: "follow",
        method,
        headers: { ...this.defaultHeaders },
        body,
        signal: this.abortSignal,
        referrer: this.delegate.referrer?.href
      };
      this.enctype = enctype;
    }
    get method() {
      return this.fetchOptions.method;
    }
    set method(value) {
      const fetchBody = this.isSafe ? this.url.searchParams : this.fetchOptions.body || new FormData();
      const fetchMethod = fetchMethodFromString(value) || FetchMethod.get;
      this.url.search = "";
      const [url, body] = buildResourceAndBody(this.url, fetchMethod, fetchBody, this.enctype);
      this.url = url;
      this.fetchOptions.body = body;
      this.fetchOptions.method = fetchMethod;
    }
    get headers() {
      return this.fetchOptions.headers;
    }
    set headers(value) {
      this.fetchOptions.headers = value;
    }
    get body() {
      if (this.isSafe) {
        return this.url.searchParams;
      } else {
        return this.fetchOptions.body;
      }
    }
    set body(value) {
      this.fetchOptions.body = value;
    }
    get location() {
      return this.url;
    }
    get params() {
      return this.url.searchParams;
    }
    get entries() {
      return this.body ? Array.from(this.body.entries()) : [];
    }
    cancel() {
      this.abortController.abort();
    }
    async perform() {
      const { fetchOptions } = this;
      this.delegate.prepareRequest(this);
      const event = await this.#allowRequestToBeIntercepted(fetchOptions);
      try {
        this.delegate.requestStarted(this);
        if (event.detail.fetchRequest) {
          this.response = event.detail.fetchRequest.response;
        } else {
          this.response = fetchWithTurboHeaders(this.url.href, fetchOptions);
        }
        const response = await this.response;
        return await this.receive(response);
      } catch (error2) {
        if (error2.name !== "AbortError") {
          if (this.#willDelegateErrorHandling(error2)) {
            this.delegate.requestErrored(this, error2);
          }
          throw error2;
        }
      } finally {
        this.delegate.requestFinished(this);
      }
    }
    async receive(response) {
      const fetchResponse = new FetchResponse(response);
      const event = dispatch("turbo:before-fetch-response", {
        cancelable: true,
        detail: { fetchResponse },
        target: this.target
      });
      if (event.defaultPrevented) {
        this.delegate.requestPreventedHandlingResponse(this, fetchResponse);
      } else if (fetchResponse.succeeded) {
        this.delegate.requestSucceededWithResponse(this, fetchResponse);
      } else {
        this.delegate.requestFailedWithResponse(this, fetchResponse);
      }
      return fetchResponse;
    }
    get defaultHeaders() {
      return {
        Accept: "text/html, application/xhtml+xml"
      };
    }
    get isSafe() {
      return isSafe(this.method);
    }
    get abortSignal() {
      return this.abortController.signal;
    }
    acceptResponseType(mimeType) {
      this.headers["Accept"] = [mimeType, this.headers["Accept"]].join(", ");
    }
    async #allowRequestToBeIntercepted(fetchOptions) {
      const requestInterception = new Promise((resolve) => this.#resolveRequestPromise = resolve);
      const event = dispatch("turbo:before-fetch-request", {
        cancelable: true,
        detail: {
          fetchOptions,
          url: this.url,
          resume: this.#resolveRequestPromise
        },
        target: this.target
      });
      this.url = event.detail.url;
      if (event.defaultPrevented)
        await requestInterception;
      return event;
    }
    #willDelegateErrorHandling(error2) {
      const event = dispatch("turbo:fetch-request-error", {
        target: this.target,
        cancelable: true,
        detail: { request: this, error: error2 }
      });
      return !event.defaultPrevented;
    }
  };
  function isSafe(fetchMethod) {
    return fetchMethodFromString(fetchMethod) == FetchMethod.get;
  }
  function buildResourceAndBody(resource, method, requestBody, enctype) {
    const searchParams = Array.from(requestBody).length > 0 ? new URLSearchParams(entriesExcludingFiles(requestBody)) : resource.searchParams;
    if (isSafe(method)) {
      return [mergeIntoURLSearchParams(resource, searchParams), null];
    } else if (enctype == FetchEnctype.urlEncoded) {
      return [resource, searchParams];
    } else {
      return [resource, requestBody];
    }
  }
  function entriesExcludingFiles(requestBody) {
    const entries = [];
    for (const [name, value] of requestBody) {
      if (value instanceof File)
        continue;
      else
        entries.push([name, value]);
    }
    return entries;
  }
  function mergeIntoURLSearchParams(url, requestBody) {
    const searchParams = new URLSearchParams(entriesExcludingFiles(requestBody));
    url.search = searchParams.toString();
    return url;
  }
  var AppearanceObserver = class {
    started = false;
    constructor(delegate, element) {
      this.delegate = delegate;
      this.element = element;
      this.intersectionObserver = new IntersectionObserver(this.intersect);
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.intersectionObserver.observe(this.element);
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        this.intersectionObserver.unobserve(this.element);
      }
    }
    intersect = (entries) => {
      const lastEntry = entries.slice(-1)[0];
      if (lastEntry?.isIntersecting) {
        this.delegate.elementAppearedInViewport(this.element);
      }
    };
  };
  var StreamMessage = class {
    static contentType = "text/vnd.turbo-stream.html";
    static wrap(message) {
      if (typeof message == "string") {
        return new this(createDocumentFragment(message));
      } else {
        return message;
      }
    }
    constructor(fragment) {
      this.fragment = importStreamElements(fragment);
    }
  };
  function importStreamElements(fragment) {
    for (const element of fragment.querySelectorAll("turbo-stream")) {
      const streamElement = document.importNode(element, true);
      for (const inertScriptElement of streamElement.templateElement.content.querySelectorAll("script")) {
        inertScriptElement.replaceWith(activateScriptElement(inertScriptElement));
      }
      element.replaceWith(streamElement);
    }
    return fragment;
  }
  var PREFETCH_DELAY = 100;
  var PrefetchCache = class {
    #prefetchTimeout = null;
    #prefetched = null;
    get(url) {
      if (this.#prefetched && this.#prefetched.url === url && this.#prefetched.expire > Date.now()) {
        return this.#prefetched.request;
      }
    }
    setLater(url, request, ttl) {
      this.clear();
      this.#prefetchTimeout = setTimeout(() => {
        request.perform();
        this.set(url, request, ttl);
        this.#prefetchTimeout = null;
      }, PREFETCH_DELAY);
    }
    set(url, request, ttl) {
      this.#prefetched = { url, request, expire: new Date((/* @__PURE__ */ new Date()).getTime() + ttl) };
    }
    clear() {
      if (this.#prefetchTimeout)
        clearTimeout(this.#prefetchTimeout);
      this.#prefetched = null;
    }
  };
  var cacheTtl = 10 * 1e3;
  var prefetchCache = new PrefetchCache();
  var FormSubmissionState = {
    initialized: "initialized",
    requesting: "requesting",
    waiting: "waiting",
    receiving: "receiving",
    stopping: "stopping",
    stopped: "stopped"
  };
  var FormSubmission = class _FormSubmission {
    state = FormSubmissionState.initialized;
    static confirmMethod(message, _element, _submitter) {
      return Promise.resolve(confirm(message));
    }
    constructor(delegate, formElement, submitter, mustRedirect = false) {
      const method = getMethod(formElement, submitter);
      const action = getAction(getFormAction(formElement, submitter), method);
      const body = buildFormData(formElement, submitter);
      const enctype = getEnctype(formElement, submitter);
      this.delegate = delegate;
      this.formElement = formElement;
      this.submitter = submitter;
      this.fetchRequest = new FetchRequest(this, method, action, body, formElement, enctype);
      this.mustRedirect = mustRedirect;
    }
    get method() {
      return this.fetchRequest.method;
    }
    set method(value) {
      this.fetchRequest.method = value;
    }
    get action() {
      return this.fetchRequest.url.toString();
    }
    set action(value) {
      this.fetchRequest.url = expandURL(value);
    }
    get body() {
      return this.fetchRequest.body;
    }
    get enctype() {
      return this.fetchRequest.enctype;
    }
    get isSafe() {
      return this.fetchRequest.isSafe;
    }
    get location() {
      return this.fetchRequest.url;
    }
    // The submission process
    async start() {
      const { initialized, requesting } = FormSubmissionState;
      const confirmationMessage = getAttribute("data-turbo-confirm", this.submitter, this.formElement);
      if (typeof confirmationMessage === "string") {
        const answer = await _FormSubmission.confirmMethod(confirmationMessage, this.formElement, this.submitter);
        if (!answer) {
          return;
        }
      }
      if (this.state == initialized) {
        this.state = requesting;
        return this.fetchRequest.perform();
      }
    }
    stop() {
      const { stopping, stopped } = FormSubmissionState;
      if (this.state != stopping && this.state != stopped) {
        this.state = stopping;
        this.fetchRequest.cancel();
        return true;
      }
    }
    // Fetch request delegate
    prepareRequest(request) {
      if (!request.isSafe) {
        const token = getCookieValue(getMetaContent("csrf-param")) || getMetaContent("csrf-token");
        if (token) {
          request.headers["X-CSRF-Token"] = token;
        }
      }
      if (this.requestAcceptsTurboStreamResponse(request)) {
        request.acceptResponseType(StreamMessage.contentType);
      }
    }
    requestStarted(_request) {
      this.state = FormSubmissionState.waiting;
      this.submitter?.setAttribute("disabled", "");
      this.setSubmitsWith();
      markAsBusy(this.formElement);
      dispatch("turbo:submit-start", {
        target: this.formElement,
        detail: { formSubmission: this }
      });
      this.delegate.formSubmissionStarted(this);
    }
    requestPreventedHandlingResponse(request, response) {
      prefetchCache.clear();
      this.result = { success: response.succeeded, fetchResponse: response };
    }
    requestSucceededWithResponse(request, response) {
      if (response.clientError || response.serverError) {
        this.delegate.formSubmissionFailedWithResponse(this, response);
        return;
      }
      prefetchCache.clear();
      if (this.requestMustRedirect(request) && responseSucceededWithoutRedirect(response)) {
        const error2 = new Error("Form responses must redirect to another location");
        this.delegate.formSubmissionErrored(this, error2);
      } else {
        this.state = FormSubmissionState.receiving;
        this.result = { success: true, fetchResponse: response };
        this.delegate.formSubmissionSucceededWithResponse(this, response);
      }
    }
    requestFailedWithResponse(request, response) {
      this.result = { success: false, fetchResponse: response };
      this.delegate.formSubmissionFailedWithResponse(this, response);
    }
    requestErrored(request, error2) {
      this.result = { success: false, error: error2 };
      this.delegate.formSubmissionErrored(this, error2);
    }
    requestFinished(_request) {
      this.state = FormSubmissionState.stopped;
      this.submitter?.removeAttribute("disabled");
      this.resetSubmitterText();
      clearBusyState(this.formElement);
      dispatch("turbo:submit-end", {
        target: this.formElement,
        detail: { formSubmission: this, ...this.result }
      });
      this.delegate.formSubmissionFinished(this);
    }
    // Private
    setSubmitsWith() {
      if (!this.submitter || !this.submitsWith)
        return;
      if (this.submitter.matches("button")) {
        this.originalSubmitText = this.submitter.innerHTML;
        this.submitter.innerHTML = this.submitsWith;
      } else if (this.submitter.matches("input")) {
        const input = this.submitter;
        this.originalSubmitText = input.value;
        input.value = this.submitsWith;
      }
    }
    resetSubmitterText() {
      if (!this.submitter || !this.originalSubmitText)
        return;
      if (this.submitter.matches("button")) {
        this.submitter.innerHTML = this.originalSubmitText;
      } else if (this.submitter.matches("input")) {
        const input = this.submitter;
        input.value = this.originalSubmitText;
      }
    }
    requestMustRedirect(request) {
      return !request.isSafe && this.mustRedirect;
    }
    requestAcceptsTurboStreamResponse(request) {
      return !request.isSafe || hasAttribute("data-turbo-stream", this.submitter, this.formElement);
    }
    get submitsWith() {
      return this.submitter?.getAttribute("data-turbo-submits-with");
    }
  };
  function buildFormData(formElement, submitter) {
    const formData = new FormData(formElement);
    const name = submitter?.getAttribute("name");
    const value = submitter?.getAttribute("value");
    if (name) {
      formData.append(name, value || "");
    }
    return formData;
  }
  function getCookieValue(cookieName) {
    if (cookieName != null) {
      const cookies = document.cookie ? document.cookie.split("; ") : [];
      const cookie = cookies.find((cookie2) => cookie2.startsWith(cookieName));
      if (cookie) {
        const value = cookie.split("=").slice(1).join("=");
        return value ? decodeURIComponent(value) : void 0;
      }
    }
  }
  function responseSucceededWithoutRedirect(response) {
    return response.statusCode == 200 && !response.redirected;
  }
  function getFormAction(formElement, submitter) {
    const formElementAction = typeof formElement.action === "string" ? formElement.action : null;
    if (submitter?.hasAttribute("formaction")) {
      return submitter.getAttribute("formaction") || "";
    } else {
      return formElement.getAttribute("action") || formElementAction || "";
    }
  }
  function getAction(formAction, fetchMethod) {
    const action = expandURL(formAction);
    if (isSafe(fetchMethod)) {
      action.search = "";
    }
    return action;
  }
  function getMethod(formElement, submitter) {
    const method = submitter?.getAttribute("formmethod") || formElement.getAttribute("method") || "";
    return fetchMethodFromString(method.toLowerCase()) || FetchMethod.get;
  }
  function getEnctype(formElement, submitter) {
    return fetchEnctypeFromString(submitter?.getAttribute("formenctype") || formElement.enctype);
  }
  var Snapshot = class {
    constructor(element) {
      this.element = element;
    }
    get activeElement() {
      return this.element.ownerDocument.activeElement;
    }
    get children() {
      return [...this.element.children];
    }
    hasAnchor(anchor) {
      return this.getElementForAnchor(anchor) != null;
    }
    getElementForAnchor(anchor) {
      return anchor ? this.element.querySelector(`[id='${anchor}'], a[name='${anchor}']`) : null;
    }
    get isConnected() {
      return this.element.isConnected;
    }
    get firstAutofocusableElement() {
      return queryAutofocusableElement(this.element);
    }
    get permanentElements() {
      return queryPermanentElementsAll(this.element);
    }
    getPermanentElementById(id) {
      return getPermanentElementById(this.element, id);
    }
    getPermanentElementMapForSnapshot(snapshot) {
      const permanentElementMap = {};
      for (const currentPermanentElement of this.permanentElements) {
        const { id } = currentPermanentElement;
        const newPermanentElement = snapshot.getPermanentElementById(id);
        if (newPermanentElement) {
          permanentElementMap[id] = [currentPermanentElement, newPermanentElement];
        }
      }
      return permanentElementMap;
    }
  };
  function getPermanentElementById(node, id) {
    return node.querySelector(`#${id}[data-turbo-permanent]`);
  }
  function queryPermanentElementsAll(node) {
    return node.querySelectorAll("[id][data-turbo-permanent]");
  }
  var FormSubmitObserver = class {
    started = false;
    constructor(delegate, eventTarget) {
      this.delegate = delegate;
      this.eventTarget = eventTarget;
    }
    start() {
      if (!this.started) {
        this.eventTarget.addEventListener("submit", this.submitCaptured, true);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        this.eventTarget.removeEventListener("submit", this.submitCaptured, true);
        this.started = false;
      }
    }
    submitCaptured = () => {
      this.eventTarget.removeEventListener("submit", this.submitBubbled, false);
      this.eventTarget.addEventListener("submit", this.submitBubbled, false);
    };
    submitBubbled = (event) => {
      if (!event.defaultPrevented) {
        const form = event.target instanceof HTMLFormElement ? event.target : void 0;
        const submitter = event.submitter || void 0;
        if (form && submissionDoesNotDismissDialog(form, submitter) && submissionDoesNotTargetIFrame(form, submitter) && this.delegate.willSubmitForm(form, submitter)) {
          event.preventDefault();
          event.stopImmediatePropagation();
          this.delegate.formSubmitted(form, submitter);
        }
      }
    };
  };
  function submissionDoesNotDismissDialog(form, submitter) {
    const method = submitter?.getAttribute("formmethod") || form.getAttribute("method");
    return method != "dialog";
  }
  function submissionDoesNotTargetIFrame(form, submitter) {
    if (submitter?.hasAttribute("formtarget") || form.hasAttribute("target")) {
      const target = submitter?.getAttribute("formtarget") || form.target;
      for (const element of document.getElementsByName(target)) {
        if (element instanceof HTMLIFrameElement)
          return false;
      }
      return true;
    } else {
      return true;
    }
  }
  var View = class {
    #resolveRenderPromise = (_value) => {
    };
    #resolveInterceptionPromise = (_value) => {
    };
    constructor(delegate, element) {
      this.delegate = delegate;
      this.element = element;
    }
    // Scrolling
    scrollToAnchor(anchor) {
      const element = this.snapshot.getElementForAnchor(anchor);
      if (element) {
        this.scrollToElement(element);
        this.focusElement(element);
      } else {
        this.scrollToPosition({ x: 0, y: 0 });
      }
    }
    scrollToAnchorFromLocation(location2) {
      this.scrollToAnchor(getAnchor(location2));
    }
    scrollToElement(element) {
      element.scrollIntoView();
    }
    focusElement(element) {
      if (element instanceof HTMLElement) {
        if (element.hasAttribute("tabindex")) {
          element.focus();
        } else {
          element.setAttribute("tabindex", "-1");
          element.focus();
          element.removeAttribute("tabindex");
        }
      }
    }
    scrollToPosition({ x: x2, y: y2 }) {
      this.scrollRoot.scrollTo(x2, y2);
    }
    scrollToTop() {
      this.scrollToPosition({ x: 0, y: 0 });
    }
    get scrollRoot() {
      return window;
    }
    // Rendering
    async render(renderer) {
      const { isPreview, shouldRender, willRender, newSnapshot: snapshot } = renderer;
      const shouldInvalidate = willRender;
      if (shouldRender) {
        try {
          this.renderPromise = new Promise((resolve) => this.#resolveRenderPromise = resolve);
          this.renderer = renderer;
          await this.prepareToRenderSnapshot(renderer);
          const renderInterception = new Promise((resolve) => this.#resolveInterceptionPromise = resolve);
          const options = { resume: this.#resolveInterceptionPromise, render: this.renderer.renderElement, renderMethod: this.renderer.renderMethod };
          const immediateRender = this.delegate.allowsImmediateRender(snapshot, options);
          if (!immediateRender)
            await renderInterception;
          await this.renderSnapshot(renderer);
          this.delegate.viewRenderedSnapshot(snapshot, isPreview, this.renderer.renderMethod);
          this.delegate.preloadOnLoadLinksForView(this.element);
          this.finishRenderingSnapshot(renderer);
        } finally {
          delete this.renderer;
          this.#resolveRenderPromise(void 0);
          delete this.renderPromise;
        }
      } else if (shouldInvalidate) {
        this.invalidate(renderer.reloadReason);
      }
    }
    invalidate(reason) {
      this.delegate.viewInvalidated(reason);
    }
    async prepareToRenderSnapshot(renderer) {
      this.markAsPreview(renderer.isPreview);
      await renderer.prepareToRender();
    }
    markAsPreview(isPreview) {
      if (isPreview) {
        this.element.setAttribute("data-turbo-preview", "");
      } else {
        this.element.removeAttribute("data-turbo-preview");
      }
    }
    markVisitDirection(direction) {
      this.element.setAttribute("data-turbo-visit-direction", direction);
    }
    unmarkVisitDirection() {
      this.element.removeAttribute("data-turbo-visit-direction");
    }
    async renderSnapshot(renderer) {
      await renderer.render();
    }
    finishRenderingSnapshot(renderer) {
      renderer.finishRendering();
    }
  };
  var FrameView = class extends View {
    missing() {
      this.element.innerHTML = `<strong class="turbo-frame-error">Content missing</strong>`;
    }
    get snapshot() {
      return new Snapshot(this.element);
    }
  };
  var LinkInterceptor = class {
    constructor(delegate, element) {
      this.delegate = delegate;
      this.element = element;
    }
    start() {
      this.element.addEventListener("click", this.clickBubbled);
      document.addEventListener("turbo:click", this.linkClicked);
      document.addEventListener("turbo:before-visit", this.willVisit);
    }
    stop() {
      this.element.removeEventListener("click", this.clickBubbled);
      document.removeEventListener("turbo:click", this.linkClicked);
      document.removeEventListener("turbo:before-visit", this.willVisit);
    }
    clickBubbled = (event) => {
      if (this.respondsToEventTarget(event.target)) {
        this.clickEvent = event;
      } else {
        delete this.clickEvent;
      }
    };
    linkClicked = (event) => {
      if (this.clickEvent && this.respondsToEventTarget(event.target) && event.target instanceof Element) {
        if (this.delegate.shouldInterceptLinkClick(event.target, event.detail.url, event.detail.originalEvent)) {
          this.clickEvent.preventDefault();
          event.preventDefault();
          this.delegate.linkClickIntercepted(event.target, event.detail.url, event.detail.originalEvent);
        }
      }
      delete this.clickEvent;
    };
    willVisit = (_event) => {
      delete this.clickEvent;
    };
    respondsToEventTarget(target) {
      const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
      return element && element.closest("turbo-frame, html") == this.element;
    }
  };
  var LinkClickObserver = class {
    started = false;
    constructor(delegate, eventTarget) {
      this.delegate = delegate;
      this.eventTarget = eventTarget;
    }
    start() {
      if (!this.started) {
        this.eventTarget.addEventListener("click", this.clickCaptured, true);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        this.eventTarget.removeEventListener("click", this.clickCaptured, true);
        this.started = false;
      }
    }
    clickCaptured = () => {
      this.eventTarget.removeEventListener("click", this.clickBubbled, false);
      this.eventTarget.addEventListener("click", this.clickBubbled, false);
    };
    clickBubbled = (event) => {
      if (event instanceof MouseEvent && this.clickEventIsSignificant(event)) {
        const target = event.composedPath && event.composedPath()[0] || event.target;
        const link = findLinkFromClickTarget(target);
        if (link && doesNotTargetIFrame(link)) {
          const location2 = getLocationForLink(link);
          if (this.delegate.willFollowLinkToLocation(link, location2, event)) {
            event.preventDefault();
            this.delegate.followedLinkToLocation(link, location2);
          }
        }
      }
    };
    clickEventIsSignificant(event) {
      return !(event.target && event.target.isContentEditable || event.defaultPrevented || event.which > 1 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
    }
  };
  var FormLinkClickObserver = class {
    constructor(delegate, element) {
      this.delegate = delegate;
      this.linkInterceptor = new LinkClickObserver(this, element);
    }
    start() {
      this.linkInterceptor.start();
    }
    stop() {
      this.linkInterceptor.stop();
    }
    // Link hover observer delegate
    canPrefetchRequestToLocation(link, location2) {
      return false;
    }
    prefetchAndCacheRequestToLocation(link, location2) {
      return;
    }
    // Link click observer delegate
    willFollowLinkToLocation(link, location2, originalEvent) {
      return this.delegate.willSubmitFormLinkToLocation(link, location2, originalEvent) && (link.hasAttribute("data-turbo-method") || link.hasAttribute("data-turbo-stream"));
    }
    followedLinkToLocation(link, location2) {
      const form = document.createElement("form");
      const type = "hidden";
      for (const [name, value] of location2.searchParams) {
        form.append(Object.assign(document.createElement("input"), { type, name, value }));
      }
      const action = Object.assign(location2, { search: "" });
      form.setAttribute("data-turbo", "true");
      form.setAttribute("action", action.href);
      form.setAttribute("hidden", "");
      const method = link.getAttribute("data-turbo-method");
      if (method)
        form.setAttribute("method", method);
      const turboFrame = link.getAttribute("data-turbo-frame");
      if (turboFrame)
        form.setAttribute("data-turbo-frame", turboFrame);
      const turboAction = getVisitAction(link);
      if (turboAction)
        form.setAttribute("data-turbo-action", turboAction);
      const turboConfirm = link.getAttribute("data-turbo-confirm");
      if (turboConfirm)
        form.setAttribute("data-turbo-confirm", turboConfirm);
      const turboStream = link.hasAttribute("data-turbo-stream");
      if (turboStream)
        form.setAttribute("data-turbo-stream", "");
      this.delegate.submittedFormLinkToLocation(link, location2, form);
      document.body.appendChild(form);
      form.addEventListener("turbo:submit-end", () => form.remove(), { once: true });
      requestAnimationFrame(() => form.requestSubmit());
    }
  };
  var Bardo = class {
    static async preservingPermanentElements(delegate, permanentElementMap, callback) {
      const bardo = new this(delegate, permanentElementMap);
      bardo.enter();
      await callback();
      bardo.leave();
    }
    constructor(delegate, permanentElementMap) {
      this.delegate = delegate;
      this.permanentElementMap = permanentElementMap;
    }
    enter() {
      for (const id in this.permanentElementMap) {
        const [currentPermanentElement, newPermanentElement] = this.permanentElementMap[id];
        this.delegate.enteringBardo(currentPermanentElement, newPermanentElement);
        this.replaceNewPermanentElementWithPlaceholder(newPermanentElement);
      }
    }
    leave() {
      for (const id in this.permanentElementMap) {
        const [currentPermanentElement] = this.permanentElementMap[id];
        this.replaceCurrentPermanentElementWithClone(currentPermanentElement);
        this.replacePlaceholderWithPermanentElement(currentPermanentElement);
        this.delegate.leavingBardo(currentPermanentElement);
      }
    }
    replaceNewPermanentElementWithPlaceholder(permanentElement) {
      const placeholder = createPlaceholderForPermanentElement(permanentElement);
      permanentElement.replaceWith(placeholder);
    }
    replaceCurrentPermanentElementWithClone(permanentElement) {
      const clone = permanentElement.cloneNode(true);
      permanentElement.replaceWith(clone);
    }
    replacePlaceholderWithPermanentElement(permanentElement) {
      const placeholder = this.getPlaceholderById(permanentElement.id);
      placeholder?.replaceWith(permanentElement);
    }
    getPlaceholderById(id) {
      return this.placeholders.find((element) => element.content == id);
    }
    get placeholders() {
      return [...document.querySelectorAll("meta[name=turbo-permanent-placeholder][content]")];
    }
  };
  function createPlaceholderForPermanentElement(permanentElement) {
    const element = document.createElement("meta");
    element.setAttribute("name", "turbo-permanent-placeholder");
    element.setAttribute("content", permanentElement.id);
    return element;
  }
  var Renderer = class {
    #activeElement = null;
    constructor(currentSnapshot, newSnapshot, renderElement, isPreview, willRender = true) {
      this.currentSnapshot = currentSnapshot;
      this.newSnapshot = newSnapshot;
      this.isPreview = isPreview;
      this.willRender = willRender;
      this.renderElement = renderElement;
      this.promise = new Promise((resolve, reject) => this.resolvingFunctions = { resolve, reject });
    }
    get shouldRender() {
      return true;
    }
    get reloadReason() {
      return;
    }
    prepareToRender() {
      return;
    }
    render() {
    }
    finishRendering() {
      if (this.resolvingFunctions) {
        this.resolvingFunctions.resolve();
        delete this.resolvingFunctions;
      }
    }
    async preservingPermanentElements(callback) {
      await Bardo.preservingPermanentElements(this, this.permanentElementMap, callback);
    }
    focusFirstAutofocusableElement() {
      const element = this.connectedSnapshot.firstAutofocusableElement;
      if (element) {
        element.focus();
      }
    }
    // Bardo delegate
    enteringBardo(currentPermanentElement) {
      if (this.#activeElement)
        return;
      if (currentPermanentElement.contains(this.currentSnapshot.activeElement)) {
        this.#activeElement = this.currentSnapshot.activeElement;
      }
    }
    leavingBardo(currentPermanentElement) {
      if (currentPermanentElement.contains(this.#activeElement) && this.#activeElement instanceof HTMLElement) {
        this.#activeElement.focus();
        this.#activeElement = null;
      }
    }
    get connectedSnapshot() {
      return this.newSnapshot.isConnected ? this.newSnapshot : this.currentSnapshot;
    }
    get currentElement() {
      return this.currentSnapshot.element;
    }
    get newElement() {
      return this.newSnapshot.element;
    }
    get permanentElementMap() {
      return this.currentSnapshot.getPermanentElementMapForSnapshot(this.newSnapshot);
    }
    get renderMethod() {
      return "replace";
    }
  };
  var FrameRenderer = class extends Renderer {
    static renderElement(currentElement, newElement) {
      const destinationRange = document.createRange();
      destinationRange.selectNodeContents(currentElement);
      destinationRange.deleteContents();
      const frameElement = newElement;
      const sourceRange = frameElement.ownerDocument?.createRange();
      if (sourceRange) {
        sourceRange.selectNodeContents(frameElement);
        currentElement.appendChild(sourceRange.extractContents());
      }
    }
    constructor(delegate, currentSnapshot, newSnapshot, renderElement, isPreview, willRender = true) {
      super(currentSnapshot, newSnapshot, renderElement, isPreview, willRender);
      this.delegate = delegate;
    }
    get shouldRender() {
      return true;
    }
    async render() {
      await nextRepaint();
      this.preservingPermanentElements(() => {
        this.loadFrameElement();
      });
      this.scrollFrameIntoView();
      await nextRepaint();
      this.focusFirstAutofocusableElement();
      await nextRepaint();
      this.activateScriptElements();
    }
    loadFrameElement() {
      this.delegate.willRenderFrame(this.currentElement, this.newElement);
      this.renderElement(this.currentElement, this.newElement);
    }
    scrollFrameIntoView() {
      if (this.currentElement.autoscroll || this.newElement.autoscroll) {
        const element = this.currentElement.firstElementChild;
        const block = readScrollLogicalPosition(this.currentElement.getAttribute("data-autoscroll-block"), "end");
        const behavior = readScrollBehavior(this.currentElement.getAttribute("data-autoscroll-behavior"), "auto");
        if (element) {
          element.scrollIntoView({ block, behavior });
          return true;
        }
      }
      return false;
    }
    activateScriptElements() {
      for (const inertScriptElement of this.newScriptElements) {
        const activatedScriptElement = activateScriptElement(inertScriptElement);
        inertScriptElement.replaceWith(activatedScriptElement);
      }
    }
    get newScriptElements() {
      return this.currentElement.querySelectorAll("script");
    }
  };
  function readScrollLogicalPosition(value, defaultValue) {
    if (value == "end" || value == "start" || value == "center" || value == "nearest") {
      return value;
    } else {
      return defaultValue;
    }
  }
  function readScrollBehavior(value, defaultValue) {
    if (value == "auto" || value == "smooth") {
      return value;
    } else {
      return defaultValue;
    }
  }
  var ProgressBar = class _ProgressBar {
    static animationDuration = 300;
    /*ms*/
    static get defaultCSS() {
      return unindent`
      .turbo-progress-bar {
        position: fixed;
        display: block;
        top: 0;
        left: 0;
        height: 3px;
        background: #0076ff;
        z-index: 2147483647;
        transition:
          width ${_ProgressBar.animationDuration}ms ease-out,
          opacity ${_ProgressBar.animationDuration / 2}ms ${_ProgressBar.animationDuration / 2}ms ease-in;
        transform: translate3d(0, 0, 0);
      }
    `;
    }
    hiding = false;
    value = 0;
    visible = false;
    constructor() {
      this.stylesheetElement = this.createStylesheetElement();
      this.progressElement = this.createProgressElement();
      this.installStylesheetElement();
      this.setValue(0);
    }
    show() {
      if (!this.visible) {
        this.visible = true;
        this.installProgressElement();
        this.startTrickling();
      }
    }
    hide() {
      if (this.visible && !this.hiding) {
        this.hiding = true;
        this.fadeProgressElement(() => {
          this.uninstallProgressElement();
          this.stopTrickling();
          this.visible = false;
          this.hiding = false;
        });
      }
    }
    setValue(value) {
      this.value = value;
      this.refresh();
    }
    // Private
    installStylesheetElement() {
      document.head.insertBefore(this.stylesheetElement, document.head.firstChild);
    }
    installProgressElement() {
      this.progressElement.style.width = "0";
      this.progressElement.style.opacity = "1";
      document.documentElement.insertBefore(this.progressElement, document.body);
      this.refresh();
    }
    fadeProgressElement(callback) {
      this.progressElement.style.opacity = "0";
      setTimeout(callback, _ProgressBar.animationDuration * 1.5);
    }
    uninstallProgressElement() {
      if (this.progressElement.parentNode) {
        document.documentElement.removeChild(this.progressElement);
      }
    }
    startTrickling() {
      if (!this.trickleInterval) {
        this.trickleInterval = window.setInterval(this.trickle, _ProgressBar.animationDuration);
      }
    }
    stopTrickling() {
      window.clearInterval(this.trickleInterval);
      delete this.trickleInterval;
    }
    trickle = () => {
      this.setValue(this.value + Math.random() / 100);
    };
    refresh() {
      requestAnimationFrame(() => {
        this.progressElement.style.width = `${10 + this.value * 90}%`;
      });
    }
    createStylesheetElement() {
      const element = document.createElement("style");
      element.type = "text/css";
      element.textContent = _ProgressBar.defaultCSS;
      if (this.cspNonce) {
        element.nonce = this.cspNonce;
      }
      return element;
    }
    createProgressElement() {
      const element = document.createElement("div");
      element.className = "turbo-progress-bar";
      return element;
    }
    get cspNonce() {
      return getMetaContent("csp-nonce");
    }
  };
  var HeadSnapshot = class extends Snapshot {
    detailsByOuterHTML = this.children.filter((element) => !elementIsNoscript(element)).map((element) => elementWithoutNonce(element)).reduce((result, element) => {
      const { outerHTML } = element;
      const details = outerHTML in result ? result[outerHTML] : {
        type: elementType(element),
        tracked: elementIsTracked(element),
        elements: []
      };
      return {
        ...result,
        [outerHTML]: {
          ...details,
          elements: [...details.elements, element]
        }
      };
    }, {});
    get trackedElementSignature() {
      return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => this.detailsByOuterHTML[outerHTML].tracked).join("");
    }
    getScriptElementsNotInSnapshot(snapshot) {
      return this.getElementsMatchingTypeNotInSnapshot("script", snapshot);
    }
    getStylesheetElementsNotInSnapshot(snapshot) {
      return this.getElementsMatchingTypeNotInSnapshot("stylesheet", snapshot);
    }
    getElementsMatchingTypeNotInSnapshot(matchedType, snapshot) {
      return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => !(outerHTML in snapshot.detailsByOuterHTML)).map((outerHTML) => this.detailsByOuterHTML[outerHTML]).filter(({ type }) => type == matchedType).map(({ elements: [element] }) => element);
    }
    get provisionalElements() {
      return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
        const { type, tracked, elements } = this.detailsByOuterHTML[outerHTML];
        if (type == null && !tracked) {
          return [...result, ...elements];
        } else if (elements.length > 1) {
          return [...result, ...elements.slice(1)];
        } else {
          return result;
        }
      }, []);
    }
    getMetaValue(name) {
      const element = this.findMetaElementByName(name);
      return element ? element.getAttribute("content") : null;
    }
    findMetaElementByName(name) {
      return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
        const {
          elements: [element]
        } = this.detailsByOuterHTML[outerHTML];
        return elementIsMetaElementWithName(element, name) ? element : result;
      }, void 0 | void 0);
    }
  };
  function elementType(element) {
    if (elementIsScript(element)) {
      return "script";
    } else if (elementIsStylesheet(element)) {
      return "stylesheet";
    }
  }
  function elementIsTracked(element) {
    return element.getAttribute("data-turbo-track") == "reload";
  }
  function elementIsScript(element) {
    const tagName = element.localName;
    return tagName == "script";
  }
  function elementIsNoscript(element) {
    const tagName = element.localName;
    return tagName == "noscript";
  }
  function elementIsStylesheet(element) {
    const tagName = element.localName;
    return tagName == "style" || tagName == "link" && element.getAttribute("rel") == "stylesheet";
  }
  function elementIsMetaElementWithName(element, name) {
    const tagName = element.localName;
    return tagName == "meta" && element.getAttribute("name") == name;
  }
  function elementWithoutNonce(element) {
    if (element.hasAttribute("nonce")) {
      element.setAttribute("nonce", "");
    }
    return element;
  }
  var PageSnapshot = class _PageSnapshot extends Snapshot {
    static fromHTMLString(html = "") {
      return this.fromDocument(parseHTMLDocument(html));
    }
    static fromElement(element) {
      return this.fromDocument(element.ownerDocument);
    }
    static fromDocument({ documentElement, body, head }) {
      return new this(documentElement, body, new HeadSnapshot(head));
    }
    constructor(documentElement, body, headSnapshot) {
      super(body);
      this.documentElement = documentElement;
      this.headSnapshot = headSnapshot;
    }
    clone() {
      const clonedElement = this.element.cloneNode(true);
      const selectElements = this.element.querySelectorAll("select");
      const clonedSelectElements = clonedElement.querySelectorAll("select");
      for (const [index, source] of selectElements.entries()) {
        const clone = clonedSelectElements[index];
        for (const option of clone.selectedOptions)
          option.selected = false;
        for (const option of source.selectedOptions)
          clone.options[option.index].selected = true;
      }
      for (const clonedPasswordInput of clonedElement.querySelectorAll('input[type="password"]')) {
        clonedPasswordInput.value = "";
      }
      return new _PageSnapshot(this.documentElement, clonedElement, this.headSnapshot);
    }
    get lang() {
      return this.documentElement.getAttribute("lang");
    }
    get headElement() {
      return this.headSnapshot.element;
    }
    get rootLocation() {
      const root = this.getSetting("root") ?? "/";
      return expandURL(root);
    }
    get cacheControlValue() {
      return this.getSetting("cache-control");
    }
    get isPreviewable() {
      return this.cacheControlValue != "no-preview";
    }
    get isCacheable() {
      return this.cacheControlValue != "no-cache";
    }
    get isVisitable() {
      return this.getSetting("visit-control") != "reload";
    }
    get prefersViewTransitions() {
      return this.headSnapshot.getMetaValue("view-transition") === "same-origin";
    }
    get shouldMorphPage() {
      return this.getSetting("refresh-method") === "morph";
    }
    get shouldPreserveScrollPosition() {
      return this.getSetting("refresh-scroll") === "preserve";
    }
    // Private
    getSetting(name) {
      return this.headSnapshot.getMetaValue(`turbo-${name}`);
    }
  };
  var ViewTransitioner = class {
    #viewTransitionStarted = false;
    #lastOperation = Promise.resolve();
    renderChange(useViewTransition, render) {
      if (useViewTransition && this.viewTransitionsAvailable && !this.#viewTransitionStarted) {
        this.#viewTransitionStarted = true;
        this.#lastOperation = this.#lastOperation.then(async () => {
          await document.startViewTransition(render).finished;
        });
      } else {
        this.#lastOperation = this.#lastOperation.then(render);
      }
      return this.#lastOperation;
    }
    get viewTransitionsAvailable() {
      return document.startViewTransition;
    }
  };
  var defaultOptions = {
    action: "advance",
    historyChanged: false,
    visitCachedSnapshot: () => {
    },
    willRender: true,
    updateHistory: true,
    shouldCacheSnapshot: true,
    acceptsStreamResponse: false
  };
  var TimingMetric = {
    visitStart: "visitStart",
    requestStart: "requestStart",
    requestEnd: "requestEnd",
    visitEnd: "visitEnd"
  };
  var VisitState = {
    initialized: "initialized",
    started: "started",
    canceled: "canceled",
    failed: "failed",
    completed: "completed"
  };
  var SystemStatusCode = {
    networkFailure: 0,
    timeoutFailure: -1,
    contentTypeMismatch: -2
  };
  var Direction = {
    advance: "forward",
    restore: "back",
    replace: "none"
  };
  var Visit = class {
    identifier = uuid();
    // Required by turbo-ios
    timingMetrics = {};
    followedRedirect = false;
    historyChanged = false;
    scrolled = false;
    shouldCacheSnapshot = true;
    acceptsStreamResponse = false;
    snapshotCached = false;
    state = VisitState.initialized;
    viewTransitioner = new ViewTransitioner();
    constructor(delegate, location2, restorationIdentifier, options = {}) {
      this.delegate = delegate;
      this.location = location2;
      this.restorationIdentifier = restorationIdentifier || uuid();
      const {
        action,
        historyChanged,
        referrer,
        snapshot,
        snapshotHTML,
        response,
        visitCachedSnapshot,
        willRender,
        updateHistory,
        shouldCacheSnapshot,
        acceptsStreamResponse,
        direction
      } = {
        ...defaultOptions,
        ...options
      };
      this.action = action;
      this.historyChanged = historyChanged;
      this.referrer = referrer;
      this.snapshot = snapshot;
      this.snapshotHTML = snapshotHTML;
      this.response = response;
      this.isSamePage = this.delegate.locationWithActionIsSamePage(this.location, this.action);
      this.isPageRefresh = this.view.isPageRefresh(this);
      this.visitCachedSnapshot = visitCachedSnapshot;
      this.willRender = willRender;
      this.updateHistory = updateHistory;
      this.scrolled = !willRender;
      this.shouldCacheSnapshot = shouldCacheSnapshot;
      this.acceptsStreamResponse = acceptsStreamResponse;
      this.direction = direction || Direction[action];
    }
    get adapter() {
      return this.delegate.adapter;
    }
    get view() {
      return this.delegate.view;
    }
    get history() {
      return this.delegate.history;
    }
    get restorationData() {
      return this.history.getRestorationDataForIdentifier(this.restorationIdentifier);
    }
    get silent() {
      return this.isSamePage;
    }
    start() {
      if (this.state == VisitState.initialized) {
        this.recordTimingMetric(TimingMetric.visitStart);
        this.state = VisitState.started;
        this.adapter.visitStarted(this);
        this.delegate.visitStarted(this);
      }
    }
    cancel() {
      if (this.state == VisitState.started) {
        if (this.request) {
          this.request.cancel();
        }
        this.cancelRender();
        this.state = VisitState.canceled;
      }
    }
    complete() {
      if (this.state == VisitState.started) {
        this.recordTimingMetric(TimingMetric.visitEnd);
        this.adapter.visitCompleted(this);
        this.state = VisitState.completed;
        this.followRedirect();
        if (!this.followedRedirect) {
          this.delegate.visitCompleted(this);
        }
      }
    }
    fail() {
      if (this.state == VisitState.started) {
        this.state = VisitState.failed;
        this.adapter.visitFailed(this);
        this.delegate.visitCompleted(this);
      }
    }
    changeHistory() {
      if (!this.historyChanged && this.updateHistory) {
        const actionForHistory = this.location.href === this.referrer?.href ? "replace" : this.action;
        const method = getHistoryMethodForAction(actionForHistory);
        this.history.update(method, this.location, this.restorationIdentifier);
        this.historyChanged = true;
      }
    }
    issueRequest() {
      if (this.hasPreloadedResponse()) {
        this.simulateRequest();
      } else if (this.shouldIssueRequest() && !this.request) {
        this.request = new FetchRequest(this, FetchMethod.get, this.location);
        this.request.perform();
      }
    }
    simulateRequest() {
      if (this.response) {
        this.startRequest();
        this.recordResponse();
        this.finishRequest();
      }
    }
    startRequest() {
      this.recordTimingMetric(TimingMetric.requestStart);
      this.adapter.visitRequestStarted(this);
    }
    recordResponse(response = this.response) {
      this.response = response;
      if (response) {
        const { statusCode } = response;
        if (isSuccessful(statusCode)) {
          this.adapter.visitRequestCompleted(this);
        } else {
          this.adapter.visitRequestFailedWithStatusCode(this, statusCode);
        }
      }
    }
    finishRequest() {
      this.recordTimingMetric(TimingMetric.requestEnd);
      this.adapter.visitRequestFinished(this);
    }
    loadResponse() {
      if (this.response) {
        const { statusCode, responseHTML } = this.response;
        this.render(async () => {
          if (this.shouldCacheSnapshot)
            this.cacheSnapshot();
          if (this.view.renderPromise)
            await this.view.renderPromise;
          if (isSuccessful(statusCode) && responseHTML != null) {
            const snapshot = PageSnapshot.fromHTMLString(responseHTML);
            await this.renderPageSnapshot(snapshot, false);
            this.adapter.visitRendered(this);
            this.complete();
          } else {
            await this.view.renderError(PageSnapshot.fromHTMLString(responseHTML), this);
            this.adapter.visitRendered(this);
            this.fail();
          }
        });
      }
    }
    getCachedSnapshot() {
      const snapshot = this.view.getCachedSnapshotForLocation(this.location) || this.getPreloadedSnapshot();
      if (snapshot && (!getAnchor(this.location) || snapshot.hasAnchor(getAnchor(this.location)))) {
        if (this.action == "restore" || snapshot.isPreviewable) {
          return snapshot;
        }
      }
    }
    getPreloadedSnapshot() {
      if (this.snapshotHTML) {
        return PageSnapshot.fromHTMLString(this.snapshotHTML);
      }
    }
    hasCachedSnapshot() {
      return this.getCachedSnapshot() != null;
    }
    loadCachedSnapshot() {
      const snapshot = this.getCachedSnapshot();
      if (snapshot) {
        const isPreview = this.shouldIssueRequest();
        this.render(async () => {
          this.cacheSnapshot();
          if (this.isSamePage || this.isPageRefresh) {
            this.adapter.visitRendered(this);
          } else {
            if (this.view.renderPromise)
              await this.view.renderPromise;
            await this.renderPageSnapshot(snapshot, isPreview);
            this.adapter.visitRendered(this);
            if (!isPreview) {
              this.complete();
            }
          }
        });
      }
    }
    followRedirect() {
      if (this.redirectedToLocation && !this.followedRedirect && this.response?.redirected) {
        this.adapter.visitProposedToLocation(this.redirectedToLocation, {
          action: "replace",
          response: this.response,
          shouldCacheSnapshot: false,
          willRender: false
        });
        this.followedRedirect = true;
      }
    }
    goToSamePageAnchor() {
      if (this.isSamePage) {
        this.render(async () => {
          this.cacheSnapshot();
          this.performScroll();
          this.changeHistory();
          this.adapter.visitRendered(this);
        });
      }
    }
    // Fetch request delegate
    prepareRequest(request) {
      if (this.acceptsStreamResponse) {
        request.acceptResponseType(StreamMessage.contentType);
      }
    }
    requestStarted() {
      this.startRequest();
    }
    requestPreventedHandlingResponse(_request, _response) {
    }
    async requestSucceededWithResponse(request, response) {
      const responseHTML = await response.responseHTML;
      const { redirected, statusCode } = response;
      if (responseHTML == void 0) {
        this.recordResponse({
          statusCode: SystemStatusCode.contentTypeMismatch,
          redirected
        });
      } else {
        this.redirectedToLocation = response.redirected ? response.location : void 0;
        this.recordResponse({ statusCode, responseHTML, redirected });
      }
    }
    async requestFailedWithResponse(request, response) {
      const responseHTML = await response.responseHTML;
      const { redirected, statusCode } = response;
      if (responseHTML == void 0) {
        this.recordResponse({
          statusCode: SystemStatusCode.contentTypeMismatch,
          redirected
        });
      } else {
        this.recordResponse({ statusCode, responseHTML, redirected });
      }
    }
    requestErrored(_request, _error) {
      this.recordResponse({
        statusCode: SystemStatusCode.networkFailure,
        redirected: false
      });
    }
    requestFinished() {
      this.finishRequest();
    }
    // Scrolling
    performScroll() {
      if (!this.scrolled && !this.view.forceReloaded && !this.view.shouldPreserveScrollPosition(this)) {
        if (this.action == "restore") {
          this.scrollToRestoredPosition() || this.scrollToAnchor() || this.view.scrollToTop();
        } else {
          this.scrollToAnchor() || this.view.scrollToTop();
        }
        if (this.isSamePage) {
          this.delegate.visitScrolledToSamePageLocation(this.view.lastRenderedLocation, this.location);
        }
        this.scrolled = true;
      }
    }
    scrollToRestoredPosition() {
      const { scrollPosition } = this.restorationData;
      if (scrollPosition) {
        this.view.scrollToPosition(scrollPosition);
        return true;
      }
    }
    scrollToAnchor() {
      const anchor = getAnchor(this.location);
      if (anchor != null) {
        this.view.scrollToAnchor(anchor);
        return true;
      }
    }
    // Instrumentation
    recordTimingMetric(metric) {
      this.timingMetrics[metric] = (/* @__PURE__ */ new Date()).getTime();
    }
    getTimingMetrics() {
      return { ...this.timingMetrics };
    }
    // Private
    getHistoryMethodForAction(action) {
      switch (action) {
        case "replace":
          return history.replaceState;
        case "advance":
        case "restore":
          return history.pushState;
      }
    }
    hasPreloadedResponse() {
      return typeof this.response == "object";
    }
    shouldIssueRequest() {
      if (this.isSamePage) {
        return false;
      } else if (this.action == "restore") {
        return !this.hasCachedSnapshot();
      } else {
        return this.willRender;
      }
    }
    cacheSnapshot() {
      if (!this.snapshotCached) {
        this.view.cacheSnapshot(this.snapshot).then((snapshot) => snapshot && this.visitCachedSnapshot(snapshot));
        this.snapshotCached = true;
      }
    }
    async render(callback) {
      this.cancelRender();
      this.frame = await nextRepaint();
      await callback();
      delete this.frame;
    }
    async renderPageSnapshot(snapshot, isPreview) {
      await this.viewTransitioner.renderChange(this.view.shouldTransitionTo(snapshot), async () => {
        await this.view.renderPage(snapshot, isPreview, this.willRender, this);
        this.performScroll();
      });
    }
    cancelRender() {
      if (this.frame) {
        cancelAnimationFrame(this.frame);
        delete this.frame;
      }
    }
  };
  function isSuccessful(statusCode) {
    return statusCode >= 200 && statusCode < 300;
  }
  var BrowserAdapter = class {
    progressBar = new ProgressBar();
    constructor(session2) {
      this.session = session2;
    }
    visitProposedToLocation(location2, options) {
      if (locationIsVisitable(location2, this.navigator.rootLocation)) {
        this.navigator.startVisit(location2, options?.restorationIdentifier || uuid(), options);
      } else {
        window.location.href = location2.toString();
      }
    }
    visitStarted(visit2) {
      this.location = visit2.location;
      visit2.loadCachedSnapshot();
      visit2.issueRequest();
      visit2.goToSamePageAnchor();
    }
    visitRequestStarted(visit2) {
      this.progressBar.setValue(0);
      if (visit2.hasCachedSnapshot() || visit2.action != "restore") {
        this.showVisitProgressBarAfterDelay();
      } else {
        this.showProgressBar();
      }
    }
    visitRequestCompleted(visit2) {
      visit2.loadResponse();
    }
    visitRequestFailedWithStatusCode(visit2, statusCode) {
      switch (statusCode) {
        case SystemStatusCode.networkFailure:
        case SystemStatusCode.timeoutFailure:
        case SystemStatusCode.contentTypeMismatch:
          return this.reload({
            reason: "request_failed",
            context: {
              statusCode
            }
          });
        default:
          return visit2.loadResponse();
      }
    }
    visitRequestFinished(_visit) {
    }
    visitCompleted(_visit) {
      this.progressBar.setValue(1);
      this.hideVisitProgressBar();
    }
    pageInvalidated(reason) {
      this.reload(reason);
    }
    visitFailed(_visit) {
      this.progressBar.setValue(1);
      this.hideVisitProgressBar();
    }
    visitRendered(_visit) {
    }
    // Form Submission Delegate
    formSubmissionStarted(_formSubmission) {
      this.progressBar.setValue(0);
      this.showFormProgressBarAfterDelay();
    }
    formSubmissionFinished(_formSubmission) {
      this.progressBar.setValue(1);
      this.hideFormProgressBar();
    }
    // Private
    showVisitProgressBarAfterDelay() {
      this.visitProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
    }
    hideVisitProgressBar() {
      this.progressBar.hide();
      if (this.visitProgressBarTimeout != null) {
        window.clearTimeout(this.visitProgressBarTimeout);
        delete this.visitProgressBarTimeout;
      }
    }
    showFormProgressBarAfterDelay() {
      if (this.formProgressBarTimeout == null) {
        this.formProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
      }
    }
    hideFormProgressBar() {
      this.progressBar.hide();
      if (this.formProgressBarTimeout != null) {
        window.clearTimeout(this.formProgressBarTimeout);
        delete this.formProgressBarTimeout;
      }
    }
    showProgressBar = () => {
      this.progressBar.show();
    };
    reload(reason) {
      dispatch("turbo:reload", { detail: reason });
      window.location.href = this.location?.toString() || window.location.href;
    }
    get navigator() {
      return this.session.navigator;
    }
  };
  var CacheObserver = class {
    selector = "[data-turbo-temporary]";
    deprecatedSelector = "[data-turbo-cache=false]";
    started = false;
    start() {
      if (!this.started) {
        this.started = true;
        addEventListener("turbo:before-cache", this.removeTemporaryElements, false);
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        removeEventListener("turbo:before-cache", this.removeTemporaryElements, false);
      }
    }
    removeTemporaryElements = (_event) => {
      for (const element of this.temporaryElements) {
        element.remove();
      }
    };
    get temporaryElements() {
      return [...document.querySelectorAll(this.selector), ...this.temporaryElementsWithDeprecation];
    }
    get temporaryElementsWithDeprecation() {
      const elements = document.querySelectorAll(this.deprecatedSelector);
      if (elements.length) {
        console.warn(
          `The ${this.deprecatedSelector} selector is deprecated and will be removed in a future version. Use ${this.selector} instead.`
        );
      }
      return [...elements];
    }
  };
  var FrameRedirector = class {
    constructor(session2, element) {
      this.session = session2;
      this.element = element;
      this.linkInterceptor = new LinkInterceptor(this, element);
      this.formSubmitObserver = new FormSubmitObserver(this, element);
    }
    start() {
      this.linkInterceptor.start();
      this.formSubmitObserver.start();
    }
    stop() {
      this.linkInterceptor.stop();
      this.formSubmitObserver.stop();
    }
    // Link interceptor delegate
    shouldInterceptLinkClick(element, _location, _event) {
      return this.#shouldRedirect(element);
    }
    linkClickIntercepted(element, url, event) {
      const frame = this.#findFrameElement(element);
      if (frame) {
        frame.delegate.linkClickIntercepted(element, url, event);
      }
    }
    // Form submit observer delegate
    willSubmitForm(element, submitter) {
      return element.closest("turbo-frame") == null && this.#shouldSubmit(element, submitter) && this.#shouldRedirect(element, submitter);
    }
    formSubmitted(element, submitter) {
      const frame = this.#findFrameElement(element, submitter);
      if (frame) {
        frame.delegate.formSubmitted(element, submitter);
      }
    }
    #shouldSubmit(form, submitter) {
      const action = getAction$1(form, submitter);
      const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
      const rootLocation = expandURL(meta?.content ?? "/");
      return this.#shouldRedirect(form, submitter) && locationIsVisitable(action, rootLocation);
    }
    #shouldRedirect(element, submitter) {
      const isNavigatable = element instanceof HTMLFormElement ? this.session.submissionIsNavigatable(element, submitter) : this.session.elementIsNavigatable(element);
      if (isNavigatable) {
        const frame = this.#findFrameElement(element, submitter);
        return frame ? frame != element.closest("turbo-frame") : false;
      } else {
        return false;
      }
    }
    #findFrameElement(element, submitter) {
      const id = submitter?.getAttribute("data-turbo-frame") || element.getAttribute("data-turbo-frame");
      if (id && id != "_top") {
        const frame = this.element.querySelector(`#${id}:not([disabled])`);
        if (frame instanceof FrameElement) {
          return frame;
        }
      }
    }
  };
  var History = class {
    location;
    restorationIdentifier = uuid();
    restorationData = {};
    started = false;
    pageLoaded = false;
    currentIndex = 0;
    constructor(delegate) {
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        addEventListener("popstate", this.onPopState, false);
        addEventListener("load", this.onPageLoad, false);
        this.currentIndex = history.state?.turbo?.restorationIndex || 0;
        this.started = true;
        this.replace(new URL(window.location.href));
      }
    }
    stop() {
      if (this.started) {
        removeEventListener("popstate", this.onPopState, false);
        removeEventListener("load", this.onPageLoad, false);
        this.started = false;
      }
    }
    push(location2, restorationIdentifier) {
      this.update(history.pushState, location2, restorationIdentifier);
    }
    replace(location2, restorationIdentifier) {
      this.update(history.replaceState, location2, restorationIdentifier);
    }
    update(method, location2, restorationIdentifier = uuid()) {
      if (method === history.pushState)
        ++this.currentIndex;
      const state = { turbo: { restorationIdentifier, restorationIndex: this.currentIndex } };
      method.call(history, state, "", location2.href);
      this.location = location2;
      this.restorationIdentifier = restorationIdentifier;
    }
    // Restoration data
    getRestorationDataForIdentifier(restorationIdentifier) {
      return this.restorationData[restorationIdentifier] || {};
    }
    updateRestorationData(additionalData) {
      const { restorationIdentifier } = this;
      const restorationData = this.restorationData[restorationIdentifier];
      this.restorationData[restorationIdentifier] = {
        ...restorationData,
        ...additionalData
      };
    }
    // Scroll restoration
    assumeControlOfScrollRestoration() {
      if (!this.previousScrollRestoration) {
        this.previousScrollRestoration = history.scrollRestoration ?? "auto";
        history.scrollRestoration = "manual";
      }
    }
    relinquishControlOfScrollRestoration() {
      if (this.previousScrollRestoration) {
        history.scrollRestoration = this.previousScrollRestoration;
        delete this.previousScrollRestoration;
      }
    }
    // Event handlers
    onPopState = (event) => {
      if (this.shouldHandlePopState()) {
        const { turbo } = event.state || {};
        if (turbo) {
          this.location = new URL(window.location.href);
          const { restorationIdentifier, restorationIndex } = turbo;
          this.restorationIdentifier = restorationIdentifier;
          const direction = restorationIndex > this.currentIndex ? "forward" : "back";
          this.delegate.historyPoppedToLocationWithRestorationIdentifierAndDirection(this.location, restorationIdentifier, direction);
          this.currentIndex = restorationIndex;
        }
      }
    };
    onPageLoad = async (_event) => {
      await nextMicrotask();
      this.pageLoaded = true;
    };
    // Private
    shouldHandlePopState() {
      return this.pageIsLoaded();
    }
    pageIsLoaded() {
      return this.pageLoaded || document.readyState == "complete";
    }
  };
  var LinkPrefetchObserver = class {
    started = false;
    #prefetchedLink = null;
    constructor(delegate, eventTarget) {
      this.delegate = delegate;
      this.eventTarget = eventTarget;
    }
    start() {
      if (this.started)
        return;
      if (this.eventTarget.readyState === "loading") {
        this.eventTarget.addEventListener("DOMContentLoaded", this.#enable, { once: true });
      } else {
        this.#enable();
      }
    }
    stop() {
      if (!this.started)
        return;
      this.eventTarget.removeEventListener("mouseenter", this.#tryToPrefetchRequest, {
        capture: true,
        passive: true
      });
      this.eventTarget.removeEventListener("mouseleave", this.#cancelRequestIfObsolete, {
        capture: true,
        passive: true
      });
      this.eventTarget.removeEventListener("turbo:before-fetch-request", this.#tryToUsePrefetchedRequest, true);
      this.started = false;
    }
    #enable = () => {
      this.eventTarget.addEventListener("mouseenter", this.#tryToPrefetchRequest, {
        capture: true,
        passive: true
      });
      this.eventTarget.addEventListener("mouseleave", this.#cancelRequestIfObsolete, {
        capture: true,
        passive: true
      });
      this.eventTarget.addEventListener("turbo:before-fetch-request", this.#tryToUsePrefetchedRequest, true);
      this.started = true;
    };
    #tryToPrefetchRequest = (event) => {
      if (getMetaContent("turbo-prefetch") === "false")
        return;
      const target = event.target;
      const isLink = target.matches && target.matches("a[href]:not([target^=_]):not([download])");
      if (isLink && this.#isPrefetchable(target)) {
        const link = target;
        const location2 = getLocationForLink(link);
        if (this.delegate.canPrefetchRequestToLocation(link, location2)) {
          this.#prefetchedLink = link;
          const fetchRequest = new FetchRequest(
            this,
            FetchMethod.get,
            location2,
            new URLSearchParams(),
            target
          );
          prefetchCache.setLater(location2.toString(), fetchRequest, this.#cacheTtl);
        }
      }
    };
    #cancelRequestIfObsolete = (event) => {
      if (event.target === this.#prefetchedLink)
        this.#cancelPrefetchRequest();
    };
    #cancelPrefetchRequest = () => {
      prefetchCache.clear();
      this.#prefetchedLink = null;
    };
    #tryToUsePrefetchedRequest = (event) => {
      if (event.target.tagName !== "FORM" && event.detail.fetchOptions.method === "get") {
        const cached = prefetchCache.get(event.detail.url.toString());
        if (cached) {
          event.detail.fetchRequest = cached;
        }
        prefetchCache.clear();
      }
    };
    prepareRequest(request) {
      const link = request.target;
      request.headers["X-Sec-Purpose"] = "prefetch";
      const turboFrame = link.closest("turbo-frame");
      const turboFrameTarget = link.getAttribute("data-turbo-frame") || turboFrame?.getAttribute("target") || turboFrame?.id;
      if (turboFrameTarget && turboFrameTarget !== "_top") {
        request.headers["Turbo-Frame"] = turboFrameTarget;
      }
    }
    // Fetch request interface
    requestSucceededWithResponse() {
    }
    requestStarted(fetchRequest) {
    }
    requestErrored(fetchRequest) {
    }
    requestFinished(fetchRequest) {
    }
    requestPreventedHandlingResponse(fetchRequest, fetchResponse) {
    }
    requestFailedWithResponse(fetchRequest, fetchResponse) {
    }
    get #cacheTtl() {
      return Number(getMetaContent("turbo-prefetch-cache-time")) || cacheTtl;
    }
    #isPrefetchable(link) {
      const href = link.getAttribute("href");
      if (!href)
        return false;
      if (unfetchableLink(link))
        return false;
      if (linkToTheSamePage(link))
        return false;
      if (linkOptsOut(link))
        return false;
      if (nonSafeLink(link))
        return false;
      if (eventPrevented(link))
        return false;
      return true;
    }
  };
  var unfetchableLink = (link) => {
    return link.origin !== document.location.origin || !["http:", "https:"].includes(link.protocol) || link.hasAttribute("target");
  };
  var linkToTheSamePage = (link) => {
    return link.pathname + link.search === document.location.pathname + document.location.search || link.href.startsWith("#");
  };
  var linkOptsOut = (link) => {
    if (link.getAttribute("data-turbo-prefetch") === "false")
      return true;
    if (link.getAttribute("data-turbo") === "false")
      return true;
    const turboPrefetchParent = findClosestRecursively(link, "[data-turbo-prefetch]");
    if (turboPrefetchParent && turboPrefetchParent.getAttribute("data-turbo-prefetch") === "false")
      return true;
    return false;
  };
  var nonSafeLink = (link) => {
    const turboMethod = link.getAttribute("data-turbo-method");
    if (turboMethod && turboMethod.toLowerCase() !== "get")
      return true;
    if (isUJS(link))
      return true;
    if (link.hasAttribute("data-turbo-confirm"))
      return true;
    if (link.hasAttribute("data-turbo-stream"))
      return true;
    return false;
  };
  var isUJS = (link) => {
    return link.hasAttribute("data-remote") || link.hasAttribute("data-behavior") || link.hasAttribute("data-confirm") || link.hasAttribute("data-method");
  };
  var eventPrevented = (link) => {
    const event = dispatch("turbo:before-prefetch", { target: link, cancelable: true });
    return event.defaultPrevented;
  };
  var Navigator = class {
    constructor(delegate) {
      this.delegate = delegate;
    }
    proposeVisit(location2, options = {}) {
      if (this.delegate.allowsVisitingLocationWithAction(location2, options.action)) {
        this.delegate.visitProposedToLocation(location2, options);
      }
    }
    startVisit(locatable, restorationIdentifier, options = {}) {
      this.stop();
      this.currentVisit = new Visit(this, expandURL(locatable), restorationIdentifier, {
        referrer: this.location,
        ...options
      });
      this.currentVisit.start();
    }
    submitForm(form, submitter) {
      this.stop();
      this.formSubmission = new FormSubmission(this, form, submitter, true);
      this.formSubmission.start();
    }
    stop() {
      if (this.formSubmission) {
        this.formSubmission.stop();
        delete this.formSubmission;
      }
      if (this.currentVisit) {
        this.currentVisit.cancel();
        delete this.currentVisit;
      }
    }
    get adapter() {
      return this.delegate.adapter;
    }
    get view() {
      return this.delegate.view;
    }
    get rootLocation() {
      return this.view.snapshot.rootLocation;
    }
    get history() {
      return this.delegate.history;
    }
    // Form submission delegate
    formSubmissionStarted(formSubmission) {
      if (typeof this.adapter.formSubmissionStarted === "function") {
        this.adapter.formSubmissionStarted(formSubmission);
      }
    }
    async formSubmissionSucceededWithResponse(formSubmission, fetchResponse) {
      if (formSubmission == this.formSubmission) {
        const responseHTML = await fetchResponse.responseHTML;
        if (responseHTML) {
          const shouldCacheSnapshot = formSubmission.isSafe;
          if (!shouldCacheSnapshot) {
            this.view.clearSnapshotCache();
          }
          const { statusCode, redirected } = fetchResponse;
          const action = this.#getActionForFormSubmission(formSubmission, fetchResponse);
          const visitOptions = {
            action,
            shouldCacheSnapshot,
            response: { statusCode, responseHTML, redirected }
          };
          this.proposeVisit(fetchResponse.location, visitOptions);
        }
      }
    }
    async formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
      const responseHTML = await fetchResponse.responseHTML;
      if (responseHTML) {
        const snapshot = PageSnapshot.fromHTMLString(responseHTML);
        if (fetchResponse.serverError) {
          await this.view.renderError(snapshot, this.currentVisit);
        } else {
          await this.view.renderPage(snapshot, false, true, this.currentVisit);
        }
        if (!snapshot.shouldPreserveScrollPosition) {
          this.view.scrollToTop();
        }
        this.view.clearSnapshotCache();
      }
    }
    formSubmissionErrored(formSubmission, error2) {
      console.error(error2);
    }
    formSubmissionFinished(formSubmission) {
      if (typeof this.adapter.formSubmissionFinished === "function") {
        this.adapter.formSubmissionFinished(formSubmission);
      }
    }
    // Visit delegate
    visitStarted(visit2) {
      this.delegate.visitStarted(visit2);
    }
    visitCompleted(visit2) {
      this.delegate.visitCompleted(visit2);
    }
    locationWithActionIsSamePage(location2, action) {
      const anchor = getAnchor(location2);
      const currentAnchor = getAnchor(this.view.lastRenderedLocation);
      const isRestorationToTop = action === "restore" && typeof anchor === "undefined";
      return action !== "replace" && getRequestURL(location2) === getRequestURL(this.view.lastRenderedLocation) && (isRestorationToTop || anchor != null && anchor !== currentAnchor);
    }
    visitScrolledToSamePageLocation(oldURL, newURL) {
      this.delegate.visitScrolledToSamePageLocation(oldURL, newURL);
    }
    // Visits
    get location() {
      return this.history.location;
    }
    get restorationIdentifier() {
      return this.history.restorationIdentifier;
    }
    #getActionForFormSubmission(formSubmission, fetchResponse) {
      const { submitter, formElement } = formSubmission;
      return getVisitAction(submitter, formElement) || this.#getDefaultAction(fetchResponse);
    }
    #getDefaultAction(fetchResponse) {
      const sameLocationRedirect = fetchResponse.redirected && fetchResponse.location.href === this.location?.href;
      return sameLocationRedirect ? "replace" : "advance";
    }
  };
  var PageStage = {
    initial: 0,
    loading: 1,
    interactive: 2,
    complete: 3
  };
  var PageObserver = class {
    stage = PageStage.initial;
    started = false;
    constructor(delegate) {
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        if (this.stage == PageStage.initial) {
          this.stage = PageStage.loading;
        }
        document.addEventListener("readystatechange", this.interpretReadyState, false);
        addEventListener("pagehide", this.pageWillUnload, false);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        document.removeEventListener("readystatechange", this.interpretReadyState, false);
        removeEventListener("pagehide", this.pageWillUnload, false);
        this.started = false;
      }
    }
    interpretReadyState = () => {
      const { readyState } = this;
      if (readyState == "interactive") {
        this.pageIsInteractive();
      } else if (readyState == "complete") {
        this.pageIsComplete();
      }
    };
    pageIsInteractive() {
      if (this.stage == PageStage.loading) {
        this.stage = PageStage.interactive;
        this.delegate.pageBecameInteractive();
      }
    }
    pageIsComplete() {
      this.pageIsInteractive();
      if (this.stage == PageStage.interactive) {
        this.stage = PageStage.complete;
        this.delegate.pageLoaded();
      }
    }
    pageWillUnload = () => {
      this.delegate.pageWillUnload();
    };
    get readyState() {
      return document.readyState;
    }
  };
  var ScrollObserver = class {
    started = false;
    constructor(delegate) {
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        addEventListener("scroll", this.onScroll, false);
        this.onScroll();
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        removeEventListener("scroll", this.onScroll, false);
        this.started = false;
      }
    }
    onScroll = () => {
      this.updatePosition({ x: window.pageXOffset, y: window.pageYOffset });
    };
    // Private
    updatePosition(position) {
      this.delegate.scrollPositionChanged(position);
    }
  };
  var StreamMessageRenderer = class {
    render({ fragment }) {
      Bardo.preservingPermanentElements(this, getPermanentElementMapForFragment(fragment), () => {
        withAutofocusFromFragment(fragment, () => {
          withPreservedFocus(() => {
            document.documentElement.appendChild(fragment);
          });
        });
      });
    }
    // Bardo delegate
    enteringBardo(currentPermanentElement, newPermanentElement) {
      newPermanentElement.replaceWith(currentPermanentElement.cloneNode(true));
    }
    leavingBardo() {
    }
  };
  function getPermanentElementMapForFragment(fragment) {
    const permanentElementsInDocument = queryPermanentElementsAll(document.documentElement);
    const permanentElementMap = {};
    for (const permanentElementInDocument of permanentElementsInDocument) {
      const { id } = permanentElementInDocument;
      for (const streamElement of fragment.querySelectorAll("turbo-stream")) {
        const elementInStream = getPermanentElementById(streamElement.templateElement.content, id);
        if (elementInStream) {
          permanentElementMap[id] = [permanentElementInDocument, elementInStream];
        }
      }
    }
    return permanentElementMap;
  }
  async function withAutofocusFromFragment(fragment, callback) {
    const generatedID = `turbo-stream-autofocus-${uuid()}`;
    const turboStreams = fragment.querySelectorAll("turbo-stream");
    const elementWithAutofocus = firstAutofocusableElementInStreams(turboStreams);
    let willAutofocusId = null;
    if (elementWithAutofocus) {
      if (elementWithAutofocus.id) {
        willAutofocusId = elementWithAutofocus.id;
      } else {
        willAutofocusId = generatedID;
      }
      elementWithAutofocus.id = willAutofocusId;
    }
    callback();
    await nextRepaint();
    const hasNoActiveElement = document.activeElement == null || document.activeElement == document.body;
    if (hasNoActiveElement && willAutofocusId) {
      const elementToAutofocus = document.getElementById(willAutofocusId);
      if (elementIsFocusable(elementToAutofocus)) {
        elementToAutofocus.focus();
      }
      if (elementToAutofocus && elementToAutofocus.id == generatedID) {
        elementToAutofocus.removeAttribute("id");
      }
    }
  }
  async function withPreservedFocus(callback) {
    const [activeElementBeforeRender, activeElementAfterRender] = await around(callback, () => document.activeElement);
    const restoreFocusTo = activeElementBeforeRender && activeElementBeforeRender.id;
    if (restoreFocusTo) {
      const elementToFocus = document.getElementById(restoreFocusTo);
      if (elementIsFocusable(elementToFocus) && elementToFocus != activeElementAfterRender) {
        elementToFocus.focus();
      }
    }
  }
  function firstAutofocusableElementInStreams(nodeListOfStreamElements) {
    for (const streamElement of nodeListOfStreamElements) {
      const elementWithAutofocus = queryAutofocusableElement(streamElement.templateElement.content);
      if (elementWithAutofocus)
        return elementWithAutofocus;
    }
    return null;
  }
  var StreamObserver = class {
    sources = /* @__PURE__ */ new Set();
    #started = false;
    constructor(delegate) {
      this.delegate = delegate;
    }
    start() {
      if (!this.#started) {
        this.#started = true;
        addEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
      }
    }
    stop() {
      if (this.#started) {
        this.#started = false;
        removeEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
      }
    }
    connectStreamSource(source) {
      if (!this.streamSourceIsConnected(source)) {
        this.sources.add(source);
        source.addEventListener("message", this.receiveMessageEvent, false);
      }
    }
    disconnectStreamSource(source) {
      if (this.streamSourceIsConnected(source)) {
        this.sources.delete(source);
        source.removeEventListener("message", this.receiveMessageEvent, false);
      }
    }
    streamSourceIsConnected(source) {
      return this.sources.has(source);
    }
    inspectFetchResponse = (event) => {
      const response = fetchResponseFromEvent(event);
      if (response && fetchResponseIsStream(response)) {
        event.preventDefault();
        this.receiveMessageResponse(response);
      }
    };
    receiveMessageEvent = (event) => {
      if (this.#started && typeof event.data == "string") {
        this.receiveMessageHTML(event.data);
      }
    };
    async receiveMessageResponse(response) {
      const html = await response.responseHTML;
      if (html) {
        this.receiveMessageHTML(html);
      }
    }
    receiveMessageHTML(html) {
      this.delegate.receivedMessageFromStream(StreamMessage.wrap(html));
    }
  };
  function fetchResponseFromEvent(event) {
    const fetchResponse = event.detail?.fetchResponse;
    if (fetchResponse instanceof FetchResponse) {
      return fetchResponse;
    }
  }
  function fetchResponseIsStream(response) {
    const contentType = response.contentType ?? "";
    return contentType.startsWith(StreamMessage.contentType);
  }
  var ErrorRenderer = class extends Renderer {
    static renderElement(currentElement, newElement) {
      const { documentElement, body } = document;
      documentElement.replaceChild(newElement, body);
    }
    async render() {
      this.replaceHeadAndBody();
      this.activateScriptElements();
    }
    replaceHeadAndBody() {
      const { documentElement, head } = document;
      documentElement.replaceChild(this.newHead, head);
      this.renderElement(this.currentElement, this.newElement);
    }
    activateScriptElements() {
      for (const replaceableElement of this.scriptElements) {
        const parentNode = replaceableElement.parentNode;
        if (parentNode) {
          const element = activateScriptElement(replaceableElement);
          parentNode.replaceChild(element, replaceableElement);
        }
      }
    }
    get newHead() {
      return this.newSnapshot.headSnapshot.element;
    }
    get scriptElements() {
      return document.documentElement.querySelectorAll("script");
    }
  };
  var Idiomorph = /* @__PURE__ */ function() {
    let EMPTY_SET = /* @__PURE__ */ new Set();
    let defaults = {
      morphStyle: "outerHTML",
      callbacks: {
        beforeNodeAdded: noOp,
        afterNodeAdded: noOp,
        beforeNodeMorphed: noOp,
        afterNodeMorphed: noOp,
        beforeNodeRemoved: noOp,
        afterNodeRemoved: noOp,
        beforeAttributeUpdated: noOp
      },
      head: {
        style: "merge",
        shouldPreserve: function(elt) {
          return elt.getAttribute("im-preserve") === "true";
        },
        shouldReAppend: function(elt) {
          return elt.getAttribute("im-re-append") === "true";
        },
        shouldRemove: noOp,
        afterHeadMorphed: noOp
      }
    };
    function morph(oldNode, newContent, config = {}) {
      if (oldNode instanceof Document) {
        oldNode = oldNode.documentElement;
      }
      if (typeof newContent === "string") {
        newContent = parseContent(newContent);
      }
      let normalizedContent = normalizeContent(newContent);
      let ctx = createMorphContext(oldNode, normalizedContent, config);
      return morphNormalizedContent(oldNode, normalizedContent, ctx);
    }
    function morphNormalizedContent(oldNode, normalizedNewContent, ctx) {
      if (ctx.head.block) {
        let oldHead = oldNode.querySelector("head");
        let newHead = normalizedNewContent.querySelector("head");
        if (oldHead && newHead) {
          let promises = handleHeadElement(newHead, oldHead, ctx);
          Promise.all(promises).then(function() {
            morphNormalizedContent(oldNode, normalizedNewContent, Object.assign(ctx, {
              head: {
                block: false,
                ignore: true
              }
            }));
          });
          return;
        }
      }
      if (ctx.morphStyle === "innerHTML") {
        morphChildren(normalizedNewContent, oldNode, ctx);
        return oldNode.children;
      } else if (ctx.morphStyle === "outerHTML" || ctx.morphStyle == null) {
        let bestMatch = findBestNodeMatch(normalizedNewContent, oldNode, ctx);
        let previousSibling = bestMatch?.previousSibling;
        let nextSibling = bestMatch?.nextSibling;
        let morphedNode = morphOldNodeTo(oldNode, bestMatch, ctx);
        if (bestMatch) {
          return insertSiblings(previousSibling, morphedNode, nextSibling);
        } else {
          return [];
        }
      } else {
        throw "Do not understand how to morph style " + ctx.morphStyle;
      }
    }
    function ignoreValueOfActiveElement(possibleActiveElement, ctx) {
      return ctx.ignoreActiveValue && possibleActiveElement === document.activeElement && possibleActiveElement !== document.body;
    }
    function morphOldNodeTo(oldNode, newContent, ctx) {
      if (ctx.ignoreActive && oldNode === document.activeElement)
        ;
      else if (newContent == null) {
        if (ctx.callbacks.beforeNodeRemoved(oldNode) === false)
          return oldNode;
        oldNode.remove();
        ctx.callbacks.afterNodeRemoved(oldNode);
        return null;
      } else if (!isSoftMatch(oldNode, newContent)) {
        if (ctx.callbacks.beforeNodeRemoved(oldNode) === false)
          return oldNode;
        if (ctx.callbacks.beforeNodeAdded(newContent) === false)
          return oldNode;
        oldNode.parentElement.replaceChild(newContent, oldNode);
        ctx.callbacks.afterNodeAdded(newContent);
        ctx.callbacks.afterNodeRemoved(oldNode);
        return newContent;
      } else {
        if (ctx.callbacks.beforeNodeMorphed(oldNode, newContent) === false)
          return oldNode;
        if (oldNode instanceof HTMLHeadElement && ctx.head.ignore)
          ;
        else if (oldNode instanceof HTMLHeadElement && ctx.head.style !== "morph") {
          handleHeadElement(newContent, oldNode, ctx);
        } else {
          syncNodeFrom(newContent, oldNode, ctx);
          if (!ignoreValueOfActiveElement(oldNode, ctx)) {
            morphChildren(newContent, oldNode, ctx);
          }
        }
        ctx.callbacks.afterNodeMorphed(oldNode, newContent);
        return oldNode;
      }
    }
    function morphChildren(newParent, oldParent, ctx) {
      let nextNewChild = newParent.firstChild;
      let insertionPoint = oldParent.firstChild;
      let newChild;
      while (nextNewChild) {
        newChild = nextNewChild;
        nextNewChild = newChild.nextSibling;
        if (insertionPoint == null) {
          if (ctx.callbacks.beforeNodeAdded(newChild) === false)
            return;
          oldParent.appendChild(newChild);
          ctx.callbacks.afterNodeAdded(newChild);
          removeIdsFromConsideration(ctx, newChild);
          continue;
        }
        if (isIdSetMatch(newChild, insertionPoint, ctx)) {
          morphOldNodeTo(insertionPoint, newChild, ctx);
          insertionPoint = insertionPoint.nextSibling;
          removeIdsFromConsideration(ctx, newChild);
          continue;
        }
        let idSetMatch = findIdSetMatch(newParent, oldParent, newChild, insertionPoint, ctx);
        if (idSetMatch) {
          insertionPoint = removeNodesBetween(insertionPoint, idSetMatch, ctx);
          morphOldNodeTo(idSetMatch, newChild, ctx);
          removeIdsFromConsideration(ctx, newChild);
          continue;
        }
        let softMatch = findSoftMatch(newParent, oldParent, newChild, insertionPoint, ctx);
        if (softMatch) {
          insertionPoint = removeNodesBetween(insertionPoint, softMatch, ctx);
          morphOldNodeTo(softMatch, newChild, ctx);
          removeIdsFromConsideration(ctx, newChild);
          continue;
        }
        if (ctx.callbacks.beforeNodeAdded(newChild) === false)
          return;
        oldParent.insertBefore(newChild, insertionPoint);
        ctx.callbacks.afterNodeAdded(newChild);
        removeIdsFromConsideration(ctx, newChild);
      }
      while (insertionPoint !== null) {
        let tempNode = insertionPoint;
        insertionPoint = insertionPoint.nextSibling;
        removeNode(tempNode, ctx);
      }
    }
    function ignoreAttribute(attr, to, updateType, ctx) {
      if (attr === "value" && ctx.ignoreActiveValue && to === document.activeElement) {
        return true;
      }
      return ctx.callbacks.beforeAttributeUpdated(attr, to, updateType) === false;
    }
    function syncNodeFrom(from, to, ctx) {
      let type = from.nodeType;
      if (type === 1) {
        const fromAttributes = from.attributes;
        const toAttributes = to.attributes;
        for (const fromAttribute of fromAttributes) {
          if (ignoreAttribute(fromAttribute.name, to, "update", ctx)) {
            continue;
          }
          if (to.getAttribute(fromAttribute.name) !== fromAttribute.value) {
            to.setAttribute(fromAttribute.name, fromAttribute.value);
          }
        }
        for (let i2 = toAttributes.length - 1; 0 <= i2; i2--) {
          const toAttribute = toAttributes[i2];
          if (ignoreAttribute(toAttribute.name, to, "remove", ctx)) {
            continue;
          }
          if (!from.hasAttribute(toAttribute.name)) {
            to.removeAttribute(toAttribute.name);
          }
        }
      }
      if (type === 8 || type === 3) {
        if (to.nodeValue !== from.nodeValue) {
          to.nodeValue = from.nodeValue;
        }
      }
      if (!ignoreValueOfActiveElement(to, ctx)) {
        syncInputValue(from, to, ctx);
      }
    }
    function syncBooleanAttribute(from, to, attributeName, ctx) {
      if (from[attributeName] !== to[attributeName]) {
        let ignoreUpdate = ignoreAttribute(attributeName, to, "update", ctx);
        if (!ignoreUpdate) {
          to[attributeName] = from[attributeName];
        }
        if (from[attributeName]) {
          if (!ignoreUpdate) {
            to.setAttribute(attributeName, from[attributeName]);
          }
        } else {
          if (!ignoreAttribute(attributeName, to, "remove", ctx)) {
            to.removeAttribute(attributeName);
          }
        }
      }
    }
    function syncInputValue(from, to, ctx) {
      if (from instanceof HTMLInputElement && to instanceof HTMLInputElement && from.type !== "file") {
        let fromValue = from.value;
        let toValue = to.value;
        syncBooleanAttribute(from, to, "checked", ctx);
        syncBooleanAttribute(from, to, "disabled", ctx);
        if (!from.hasAttribute("value")) {
          if (!ignoreAttribute("value", to, "remove", ctx)) {
            to.value = "";
            to.removeAttribute("value");
          }
        } else if (fromValue !== toValue) {
          if (!ignoreAttribute("value", to, "update", ctx)) {
            to.setAttribute("value", fromValue);
            to.value = fromValue;
          }
        }
      } else if (from instanceof HTMLOptionElement) {
        syncBooleanAttribute(from, to, "selected", ctx);
      } else if (from instanceof HTMLTextAreaElement && to instanceof HTMLTextAreaElement) {
        let fromValue = from.value;
        let toValue = to.value;
        if (ignoreAttribute("value", to, "update", ctx)) {
          return;
        }
        if (fromValue !== toValue) {
          to.value = fromValue;
        }
        if (to.firstChild && to.firstChild.nodeValue !== fromValue) {
          to.firstChild.nodeValue = fromValue;
        }
      }
    }
    function handleHeadElement(newHeadTag, currentHead, ctx) {
      let added = [];
      let removed = [];
      let preserved = [];
      let nodesToAppend = [];
      let headMergeStyle = ctx.head.style;
      let srcToNewHeadNodes = /* @__PURE__ */ new Map();
      for (const newHeadChild of newHeadTag.children) {
        srcToNewHeadNodes.set(newHeadChild.outerHTML, newHeadChild);
      }
      for (const currentHeadElt of currentHead.children) {
        let inNewContent = srcToNewHeadNodes.has(currentHeadElt.outerHTML);
        let isReAppended = ctx.head.shouldReAppend(currentHeadElt);
        let isPreserved = ctx.head.shouldPreserve(currentHeadElt);
        if (inNewContent || isPreserved) {
          if (isReAppended) {
            removed.push(currentHeadElt);
          } else {
            srcToNewHeadNodes.delete(currentHeadElt.outerHTML);
            preserved.push(currentHeadElt);
          }
        } else {
          if (headMergeStyle === "append") {
            if (isReAppended) {
              removed.push(currentHeadElt);
              nodesToAppend.push(currentHeadElt);
            }
          } else {
            if (ctx.head.shouldRemove(currentHeadElt) !== false) {
              removed.push(currentHeadElt);
            }
          }
        }
      }
      nodesToAppend.push(...srcToNewHeadNodes.values());
      let promises = [];
      for (const newNode of nodesToAppend) {
        let newElt = document.createRange().createContextualFragment(newNode.outerHTML).firstChild;
        if (ctx.callbacks.beforeNodeAdded(newElt) !== false) {
          if (newElt.href || newElt.src) {
            let resolve = null;
            let promise = new Promise(function(_resolve) {
              resolve = _resolve;
            });
            newElt.addEventListener("load", function() {
              resolve();
            });
            promises.push(promise);
          }
          currentHead.appendChild(newElt);
          ctx.callbacks.afterNodeAdded(newElt);
          added.push(newElt);
        }
      }
      for (const removedElement of removed) {
        if (ctx.callbacks.beforeNodeRemoved(removedElement) !== false) {
          currentHead.removeChild(removedElement);
          ctx.callbacks.afterNodeRemoved(removedElement);
        }
      }
      ctx.head.afterHeadMorphed(currentHead, { added, kept: preserved, removed });
      return promises;
    }
    function noOp() {
    }
    function mergeDefaults(config) {
      let finalConfig = {};
      Object.assign(finalConfig, defaults);
      Object.assign(finalConfig, config);
      finalConfig.callbacks = {};
      Object.assign(finalConfig.callbacks, defaults.callbacks);
      Object.assign(finalConfig.callbacks, config.callbacks);
      finalConfig.head = {};
      Object.assign(finalConfig.head, defaults.head);
      Object.assign(finalConfig.head, config.head);
      return finalConfig;
    }
    function createMorphContext(oldNode, newContent, config) {
      config = mergeDefaults(config);
      return {
        target: oldNode,
        newContent,
        config,
        morphStyle: config.morphStyle,
        ignoreActive: config.ignoreActive,
        ignoreActiveValue: config.ignoreActiveValue,
        idMap: createIdMap(oldNode, newContent),
        deadIds: /* @__PURE__ */ new Set(),
        callbacks: config.callbacks,
        head: config.head
      };
    }
    function isIdSetMatch(node1, node2, ctx) {
      if (node1 == null || node2 == null) {
        return false;
      }
      if (node1.nodeType === node2.nodeType && node1.tagName === node2.tagName) {
        if (node1.id !== "" && node1.id === node2.id) {
          return true;
        } else {
          return getIdIntersectionCount(ctx, node1, node2) > 0;
        }
      }
      return false;
    }
    function isSoftMatch(node1, node2) {
      if (node1 == null || node2 == null) {
        return false;
      }
      return node1.nodeType === node2.nodeType && node1.tagName === node2.tagName;
    }
    function removeNodesBetween(startInclusive, endExclusive, ctx) {
      while (startInclusive !== endExclusive) {
        let tempNode = startInclusive;
        startInclusive = startInclusive.nextSibling;
        removeNode(tempNode, ctx);
      }
      removeIdsFromConsideration(ctx, endExclusive);
      return endExclusive.nextSibling;
    }
    function findIdSetMatch(newContent, oldParent, newChild, insertionPoint, ctx) {
      let newChildPotentialIdCount = getIdIntersectionCount(ctx, newChild, oldParent);
      let potentialMatch = null;
      if (newChildPotentialIdCount > 0) {
        let potentialMatch2 = insertionPoint;
        let otherMatchCount = 0;
        while (potentialMatch2 != null) {
          if (isIdSetMatch(newChild, potentialMatch2, ctx)) {
            return potentialMatch2;
          }
          otherMatchCount += getIdIntersectionCount(ctx, potentialMatch2, newContent);
          if (otherMatchCount > newChildPotentialIdCount) {
            return null;
          }
          potentialMatch2 = potentialMatch2.nextSibling;
        }
      }
      return potentialMatch;
    }
    function findSoftMatch(newContent, oldParent, newChild, insertionPoint, ctx) {
      let potentialSoftMatch = insertionPoint;
      let nextSibling = newChild.nextSibling;
      let siblingSoftMatchCount = 0;
      while (potentialSoftMatch != null) {
        if (getIdIntersectionCount(ctx, potentialSoftMatch, newContent) > 0) {
          return null;
        }
        if (isSoftMatch(newChild, potentialSoftMatch)) {
          return potentialSoftMatch;
        }
        if (isSoftMatch(nextSibling, potentialSoftMatch)) {
          siblingSoftMatchCount++;
          nextSibling = nextSibling.nextSibling;
          if (siblingSoftMatchCount >= 2) {
            return null;
          }
        }
        potentialSoftMatch = potentialSoftMatch.nextSibling;
      }
      return potentialSoftMatch;
    }
    function parseContent(newContent) {
      let parser = new DOMParser();
      let contentWithSvgsRemoved = newContent.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim, "");
      if (contentWithSvgsRemoved.match(/<\/html>/) || contentWithSvgsRemoved.match(/<\/head>/) || contentWithSvgsRemoved.match(/<\/body>/)) {
        let content = parser.parseFromString(newContent, "text/html");
        if (contentWithSvgsRemoved.match(/<\/html>/)) {
          content.generatedByIdiomorph = true;
          return content;
        } else {
          let htmlElement = content.firstChild;
          if (htmlElement) {
            htmlElement.generatedByIdiomorph = true;
            return htmlElement;
          } else {
            return null;
          }
        }
      } else {
        let responseDoc = parser.parseFromString("<body><template>" + newContent + "</template></body>", "text/html");
        let content = responseDoc.body.querySelector("template").content;
        content.generatedByIdiomorph = true;
        return content;
      }
    }
    function normalizeContent(newContent) {
      if (newContent == null) {
        const dummyParent = document.createElement("div");
        return dummyParent;
      } else if (newContent.generatedByIdiomorph) {
        return newContent;
      } else if (newContent instanceof Node) {
        const dummyParent = document.createElement("div");
        dummyParent.append(newContent);
        return dummyParent;
      } else {
        const dummyParent = document.createElement("div");
        for (const elt of [...newContent]) {
          dummyParent.append(elt);
        }
        return dummyParent;
      }
    }
    function insertSiblings(previousSibling, morphedNode, nextSibling) {
      let stack = [];
      let added = [];
      while (previousSibling != null) {
        stack.push(previousSibling);
        previousSibling = previousSibling.previousSibling;
      }
      while (stack.length > 0) {
        let node = stack.pop();
        added.push(node);
        morphedNode.parentElement.insertBefore(node, morphedNode);
      }
      added.push(morphedNode);
      while (nextSibling != null) {
        stack.push(nextSibling);
        added.push(nextSibling);
        nextSibling = nextSibling.nextSibling;
      }
      while (stack.length > 0) {
        morphedNode.parentElement.insertBefore(stack.pop(), morphedNode.nextSibling);
      }
      return added;
    }
    function findBestNodeMatch(newContent, oldNode, ctx) {
      let currentElement;
      currentElement = newContent.firstChild;
      let bestElement = currentElement;
      let score = 0;
      while (currentElement) {
        let newScore = scoreElement(currentElement, oldNode, ctx);
        if (newScore > score) {
          bestElement = currentElement;
          score = newScore;
        }
        currentElement = currentElement.nextSibling;
      }
      return bestElement;
    }
    function scoreElement(node1, node2, ctx) {
      if (isSoftMatch(node1, node2)) {
        return 0.5 + getIdIntersectionCount(ctx, node1, node2);
      }
      return 0;
    }
    function removeNode(tempNode, ctx) {
      removeIdsFromConsideration(ctx, tempNode);
      if (ctx.callbacks.beforeNodeRemoved(tempNode) === false)
        return;
      tempNode.remove();
      ctx.callbacks.afterNodeRemoved(tempNode);
    }
    function isIdInConsideration(ctx, id) {
      return !ctx.deadIds.has(id);
    }
    function idIsWithinNode(ctx, id, targetNode) {
      let idSet = ctx.idMap.get(targetNode) || EMPTY_SET;
      return idSet.has(id);
    }
    function removeIdsFromConsideration(ctx, node) {
      let idSet = ctx.idMap.get(node) || EMPTY_SET;
      for (const id of idSet) {
        ctx.deadIds.add(id);
      }
    }
    function getIdIntersectionCount(ctx, node1, node2) {
      let sourceSet = ctx.idMap.get(node1) || EMPTY_SET;
      let matchCount = 0;
      for (const id of sourceSet) {
        if (isIdInConsideration(ctx, id) && idIsWithinNode(ctx, id, node2)) {
          ++matchCount;
        }
      }
      return matchCount;
    }
    function populateIdMapForNode(node, idMap) {
      let nodeParent = node.parentElement;
      let idElements = node.querySelectorAll("[id]");
      for (const elt of idElements) {
        let current = elt;
        while (current !== nodeParent && current != null) {
          let idSet = idMap.get(current);
          if (idSet == null) {
            idSet = /* @__PURE__ */ new Set();
            idMap.set(current, idSet);
          }
          idSet.add(elt.id);
          current = current.parentElement;
        }
      }
    }
    function createIdMap(oldContent, newContent) {
      let idMap = /* @__PURE__ */ new Map();
      populateIdMapForNode(oldContent, idMap);
      populateIdMapForNode(newContent, idMap);
      return idMap;
    }
    return {
      morph,
      defaults
    };
  }();
  var PageRenderer = class extends Renderer {
    static renderElement(currentElement, newElement) {
      if (document.body && newElement instanceof HTMLBodyElement) {
        document.body.replaceWith(newElement);
      } else {
        document.documentElement.appendChild(newElement);
      }
    }
    get shouldRender() {
      return this.newSnapshot.isVisitable && this.trackedElementsAreIdentical;
    }
    get reloadReason() {
      if (!this.newSnapshot.isVisitable) {
        return {
          reason: "turbo_visit_control_is_reload"
        };
      }
      if (!this.trackedElementsAreIdentical) {
        return {
          reason: "tracked_element_mismatch"
        };
      }
    }
    async prepareToRender() {
      this.#setLanguage();
      await this.mergeHead();
    }
    async render() {
      if (this.willRender) {
        await this.replaceBody();
      }
    }
    finishRendering() {
      super.finishRendering();
      if (!this.isPreview) {
        this.focusFirstAutofocusableElement();
      }
    }
    get currentHeadSnapshot() {
      return this.currentSnapshot.headSnapshot;
    }
    get newHeadSnapshot() {
      return this.newSnapshot.headSnapshot;
    }
    get newElement() {
      return this.newSnapshot.element;
    }
    #setLanguage() {
      const { documentElement } = this.currentSnapshot;
      const { lang } = this.newSnapshot;
      if (lang) {
        documentElement.setAttribute("lang", lang);
      } else {
        documentElement.removeAttribute("lang");
      }
    }
    async mergeHead() {
      const mergedHeadElements = this.mergeProvisionalElements();
      const newStylesheetElements = this.copyNewHeadStylesheetElements();
      this.copyNewHeadScriptElements();
      await mergedHeadElements;
      await newStylesheetElements;
      if (this.willRender) {
        this.removeUnusedDynamicStylesheetElements();
      }
    }
    async replaceBody() {
      await this.preservingPermanentElements(async () => {
        this.activateNewBody();
        await this.assignNewBody();
      });
    }
    get trackedElementsAreIdentical() {
      return this.currentHeadSnapshot.trackedElementSignature == this.newHeadSnapshot.trackedElementSignature;
    }
    async copyNewHeadStylesheetElements() {
      const loadingElements = [];
      for (const element of this.newHeadStylesheetElements) {
        loadingElements.push(waitForLoad(element));
        document.head.appendChild(element);
      }
      await Promise.all(loadingElements);
    }
    copyNewHeadScriptElements() {
      for (const element of this.newHeadScriptElements) {
        document.head.appendChild(activateScriptElement(element));
      }
    }
    removeUnusedDynamicStylesheetElements() {
      for (const element of this.unusedDynamicStylesheetElements) {
        document.head.removeChild(element);
      }
    }
    async mergeProvisionalElements() {
      const newHeadElements = [...this.newHeadProvisionalElements];
      for (const element of this.currentHeadProvisionalElements) {
        if (!this.isCurrentElementInElementList(element, newHeadElements)) {
          document.head.removeChild(element);
        }
      }
      for (const element of newHeadElements) {
        document.head.appendChild(element);
      }
    }
    isCurrentElementInElementList(element, elementList) {
      for (const [index, newElement] of elementList.entries()) {
        if (element.tagName == "TITLE") {
          if (newElement.tagName != "TITLE") {
            continue;
          }
          if (element.innerHTML == newElement.innerHTML) {
            elementList.splice(index, 1);
            return true;
          }
        }
        if (newElement.isEqualNode(element)) {
          elementList.splice(index, 1);
          return true;
        }
      }
      return false;
    }
    removeCurrentHeadProvisionalElements() {
      for (const element of this.currentHeadProvisionalElements) {
        document.head.removeChild(element);
      }
    }
    copyNewHeadProvisionalElements() {
      for (const element of this.newHeadProvisionalElements) {
        document.head.appendChild(element);
      }
    }
    activateNewBody() {
      document.adoptNode(this.newElement);
      this.activateNewBodyScriptElements();
    }
    activateNewBodyScriptElements() {
      for (const inertScriptElement of this.newBodyScriptElements) {
        const activatedScriptElement = activateScriptElement(inertScriptElement);
        inertScriptElement.replaceWith(activatedScriptElement);
      }
    }
    async assignNewBody() {
      await this.renderElement(this.currentElement, this.newElement);
    }
    get unusedDynamicStylesheetElements() {
      return this.oldHeadStylesheetElements.filter((element) => {
        return element.getAttribute("data-turbo-track") === "dynamic";
      });
    }
    get oldHeadStylesheetElements() {
      return this.currentHeadSnapshot.getStylesheetElementsNotInSnapshot(this.newHeadSnapshot);
    }
    get newHeadStylesheetElements() {
      return this.newHeadSnapshot.getStylesheetElementsNotInSnapshot(this.currentHeadSnapshot);
    }
    get newHeadScriptElements() {
      return this.newHeadSnapshot.getScriptElementsNotInSnapshot(this.currentHeadSnapshot);
    }
    get currentHeadProvisionalElements() {
      return this.currentHeadSnapshot.provisionalElements;
    }
    get newHeadProvisionalElements() {
      return this.newHeadSnapshot.provisionalElements;
    }
    get newBodyScriptElements() {
      return this.newElement.querySelectorAll("script");
    }
  };
  var MorphRenderer = class extends PageRenderer {
    async render() {
      if (this.willRender)
        await this.#morphBody();
    }
    get renderMethod() {
      return "morph";
    }
    // Private
    async #morphBody() {
      this.#morphElements(this.currentElement, this.newElement);
      this.#reloadRemoteFrames();
      dispatch("turbo:morph", {
        detail: {
          currentElement: this.currentElement,
          newElement: this.newElement
        }
      });
    }
    #morphElements(currentElement, newElement, morphStyle = "outerHTML") {
      this.isMorphingTurboFrame = this.#isFrameReloadedWithMorph(currentElement);
      Idiomorph.morph(currentElement, newElement, {
        morphStyle,
        callbacks: {
          beforeNodeAdded: this.#shouldAddElement,
          beforeNodeMorphed: this.#shouldMorphElement,
          beforeAttributeUpdated: this.#shouldUpdateAttribute,
          beforeNodeRemoved: this.#shouldRemoveElement,
          afterNodeMorphed: this.#didMorphElement
        }
      });
    }
    #shouldAddElement = (node) => {
      return !(node.id && node.hasAttribute("data-turbo-permanent") && document.getElementById(node.id));
    };
    #shouldMorphElement = (oldNode, newNode) => {
      if (oldNode instanceof HTMLElement) {
        if (!oldNode.hasAttribute("data-turbo-permanent") && (this.isMorphingTurboFrame || !this.#isFrameReloadedWithMorph(oldNode))) {
          const event = dispatch("turbo:before-morph-element", {
            cancelable: true,
            target: oldNode,
            detail: {
              newElement: newNode
            }
          });
          return !event.defaultPrevented;
        } else {
          return false;
        }
      }
    };
    #shouldUpdateAttribute = (attributeName, target, mutationType) => {
      const event = dispatch("turbo:before-morph-attribute", { cancelable: true, target, detail: { attributeName, mutationType } });
      return !event.defaultPrevented;
    };
    #didMorphElement = (oldNode, newNode) => {
      if (newNode instanceof HTMLElement) {
        dispatch("turbo:morph-element", {
          target: oldNode,
          detail: {
            newElement: newNode
          }
        });
      }
    };
    #shouldRemoveElement = (node) => {
      return this.#shouldMorphElement(node);
    };
    #reloadRemoteFrames() {
      this.#remoteFrames().forEach((frame) => {
        if (this.#isFrameReloadedWithMorph(frame)) {
          this.#renderFrameWithMorph(frame);
          frame.reload();
        }
      });
    }
    #renderFrameWithMorph(frame) {
      frame.addEventListener("turbo:before-frame-render", (event) => {
        event.detail.render = this.#morphFrameUpdate;
      }, { once: true });
    }
    #morphFrameUpdate = (currentElement, newElement) => {
      dispatch("turbo:before-frame-morph", {
        target: currentElement,
        detail: { currentElement, newElement }
      });
      this.#morphElements(currentElement, newElement.children, "innerHTML");
    };
    #isFrameReloadedWithMorph(element) {
      return element.src && element.refresh === "morph";
    }
    #remoteFrames() {
      return Array.from(document.querySelectorAll("turbo-frame[src]")).filter((frame) => {
        return !frame.closest("[data-turbo-permanent]");
      });
    }
  };
  var SnapshotCache = class {
    keys = [];
    snapshots = {};
    constructor(size) {
      this.size = size;
    }
    has(location2) {
      return toCacheKey(location2) in this.snapshots;
    }
    get(location2) {
      if (this.has(location2)) {
        const snapshot = this.read(location2);
        this.touch(location2);
        return snapshot;
      }
    }
    put(location2, snapshot) {
      this.write(location2, snapshot);
      this.touch(location2);
      return snapshot;
    }
    clear() {
      this.snapshots = {};
    }
    // Private
    read(location2) {
      return this.snapshots[toCacheKey(location2)];
    }
    write(location2, snapshot) {
      this.snapshots[toCacheKey(location2)] = snapshot;
    }
    touch(location2) {
      const key = toCacheKey(location2);
      const index = this.keys.indexOf(key);
      if (index > -1)
        this.keys.splice(index, 1);
      this.keys.unshift(key);
      this.trim();
    }
    trim() {
      for (const key of this.keys.splice(this.size)) {
        delete this.snapshots[key];
      }
    }
  };
  var PageView = class extends View {
    snapshotCache = new SnapshotCache(10);
    lastRenderedLocation = new URL(location.href);
    forceReloaded = false;
    shouldTransitionTo(newSnapshot) {
      return this.snapshot.prefersViewTransitions && newSnapshot.prefersViewTransitions;
    }
    renderPage(snapshot, isPreview = false, willRender = true, visit2) {
      const shouldMorphPage = this.isPageRefresh(visit2) && this.snapshot.shouldMorphPage;
      const rendererClass = shouldMorphPage ? MorphRenderer : PageRenderer;
      const renderer = new rendererClass(this.snapshot, snapshot, PageRenderer.renderElement, isPreview, willRender);
      if (!renderer.shouldRender) {
        this.forceReloaded = true;
      } else {
        visit2?.changeHistory();
      }
      return this.render(renderer);
    }
    renderError(snapshot, visit2) {
      visit2?.changeHistory();
      const renderer = new ErrorRenderer(this.snapshot, snapshot, ErrorRenderer.renderElement, false);
      return this.render(renderer);
    }
    clearSnapshotCache() {
      this.snapshotCache.clear();
    }
    async cacheSnapshot(snapshot = this.snapshot) {
      if (snapshot.isCacheable) {
        this.delegate.viewWillCacheSnapshot();
        const { lastRenderedLocation: location2 } = this;
        await nextEventLoopTick();
        const cachedSnapshot = snapshot.clone();
        this.snapshotCache.put(location2, cachedSnapshot);
        return cachedSnapshot;
      }
    }
    getCachedSnapshotForLocation(location2) {
      return this.snapshotCache.get(location2);
    }
    isPageRefresh(visit2) {
      return !visit2 || this.lastRenderedLocation.pathname === visit2.location.pathname && visit2.action === "replace";
    }
    shouldPreserveScrollPosition(visit2) {
      return this.isPageRefresh(visit2) && this.snapshot.shouldPreserveScrollPosition;
    }
    get snapshot() {
      return PageSnapshot.fromElement(this.element);
    }
  };
  var Preloader = class {
    selector = "a[data-turbo-preload]";
    constructor(delegate, snapshotCache) {
      this.delegate = delegate;
      this.snapshotCache = snapshotCache;
    }
    start() {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", this.#preloadAll);
      } else {
        this.preloadOnLoadLinksForView(document.body);
      }
    }
    stop() {
      document.removeEventListener("DOMContentLoaded", this.#preloadAll);
    }
    preloadOnLoadLinksForView(element) {
      for (const link of element.querySelectorAll(this.selector)) {
        if (this.delegate.shouldPreloadLink(link)) {
          this.preloadURL(link);
        }
      }
    }
    async preloadURL(link) {
      const location2 = new URL(link.href);
      if (this.snapshotCache.has(location2)) {
        return;
      }
      const fetchRequest = new FetchRequest(this, FetchMethod.get, location2, new URLSearchParams(), link);
      await fetchRequest.perform();
    }
    // Fetch request delegate
    prepareRequest(fetchRequest) {
      fetchRequest.headers["X-Sec-Purpose"] = "prefetch";
    }
    async requestSucceededWithResponse(fetchRequest, fetchResponse) {
      try {
        const responseHTML = await fetchResponse.responseHTML;
        const snapshot = PageSnapshot.fromHTMLString(responseHTML);
        this.snapshotCache.put(fetchRequest.url, snapshot);
      } catch (_2) {
      }
    }
    requestStarted(fetchRequest) {
    }
    requestErrored(fetchRequest) {
    }
    requestFinished(fetchRequest) {
    }
    requestPreventedHandlingResponse(fetchRequest, fetchResponse) {
    }
    requestFailedWithResponse(fetchRequest, fetchResponse) {
    }
    #preloadAll = () => {
      this.preloadOnLoadLinksForView(document.body);
    };
  };
  var Cache = class {
    constructor(session2) {
      this.session = session2;
    }
    clear() {
      this.session.clearCache();
    }
    resetCacheControl() {
      this.#setCacheControl("");
    }
    exemptPageFromCache() {
      this.#setCacheControl("no-cache");
    }
    exemptPageFromPreview() {
      this.#setCacheControl("no-preview");
    }
    #setCacheControl(value) {
      setMetaContent("turbo-cache-control", value);
    }
  };
  var Session = class {
    navigator = new Navigator(this);
    history = new History(this);
    view = new PageView(this, document.documentElement);
    adapter = new BrowserAdapter(this);
    pageObserver = new PageObserver(this);
    cacheObserver = new CacheObserver();
    linkPrefetchObserver = new LinkPrefetchObserver(this, document);
    linkClickObserver = new LinkClickObserver(this, window);
    formSubmitObserver = new FormSubmitObserver(this, document);
    scrollObserver = new ScrollObserver(this);
    streamObserver = new StreamObserver(this);
    formLinkClickObserver = new FormLinkClickObserver(this, document.documentElement);
    frameRedirector = new FrameRedirector(this, document.documentElement);
    streamMessageRenderer = new StreamMessageRenderer();
    cache = new Cache(this);
    drive = true;
    enabled = true;
    progressBarDelay = 500;
    started = false;
    formMode = "on";
    #pageRefreshDebouncePeriod = 150;
    constructor(recentRequests2) {
      this.recentRequests = recentRequests2;
      this.preloader = new Preloader(this, this.view.snapshotCache);
      this.debouncedRefresh = this.refresh;
      this.pageRefreshDebouncePeriod = this.pageRefreshDebouncePeriod;
    }
    start() {
      if (!this.started) {
        this.pageObserver.start();
        this.cacheObserver.start();
        this.linkPrefetchObserver.start();
        this.formLinkClickObserver.start();
        this.linkClickObserver.start();
        this.formSubmitObserver.start();
        this.scrollObserver.start();
        this.streamObserver.start();
        this.frameRedirector.start();
        this.history.start();
        this.preloader.start();
        this.started = true;
        this.enabled = true;
      }
    }
    disable() {
      this.enabled = false;
    }
    stop() {
      if (this.started) {
        this.pageObserver.stop();
        this.cacheObserver.stop();
        this.linkPrefetchObserver.stop();
        this.formLinkClickObserver.stop();
        this.linkClickObserver.stop();
        this.formSubmitObserver.stop();
        this.scrollObserver.stop();
        this.streamObserver.stop();
        this.frameRedirector.stop();
        this.history.stop();
        this.preloader.stop();
        this.started = false;
      }
    }
    registerAdapter(adapter) {
      this.adapter = adapter;
    }
    visit(location2, options = {}) {
      const frameElement = options.frame ? document.getElementById(options.frame) : null;
      if (frameElement instanceof FrameElement) {
        const action = options.action || getVisitAction(frameElement);
        frameElement.delegate.proposeVisitIfNavigatedWithAction(frameElement, action);
        frameElement.src = location2.toString();
      } else {
        this.navigator.proposeVisit(expandURL(location2), options);
      }
    }
    refresh(url, requestId) {
      const isRecentRequest = requestId && this.recentRequests.has(requestId);
      if (!isRecentRequest) {
        this.visit(url, { action: "replace", shouldCacheSnapshot: false });
      }
    }
    connectStreamSource(source) {
      this.streamObserver.connectStreamSource(source);
    }
    disconnectStreamSource(source) {
      this.streamObserver.disconnectStreamSource(source);
    }
    renderStreamMessage(message) {
      this.streamMessageRenderer.render(StreamMessage.wrap(message));
    }
    clearCache() {
      this.view.clearSnapshotCache();
    }
    setProgressBarDelay(delay) {
      this.progressBarDelay = delay;
    }
    setFormMode(mode) {
      this.formMode = mode;
    }
    get location() {
      return this.history.location;
    }
    get restorationIdentifier() {
      return this.history.restorationIdentifier;
    }
    get pageRefreshDebouncePeriod() {
      return this.#pageRefreshDebouncePeriod;
    }
    set pageRefreshDebouncePeriod(value) {
      this.refresh = debounce(this.debouncedRefresh.bind(this), value);
      this.#pageRefreshDebouncePeriod = value;
    }
    // Preloader delegate
    shouldPreloadLink(element) {
      const isUnsafe = element.hasAttribute("data-turbo-method");
      const isStream = element.hasAttribute("data-turbo-stream");
      const frameTarget = element.getAttribute("data-turbo-frame");
      const frame = frameTarget == "_top" ? null : document.getElementById(frameTarget) || findClosestRecursively(element, "turbo-frame:not([disabled])");
      if (isUnsafe || isStream || frame instanceof FrameElement) {
        return false;
      } else {
        const location2 = new URL(element.href);
        return this.elementIsNavigatable(element) && locationIsVisitable(location2, this.snapshot.rootLocation);
      }
    }
    // History delegate
    historyPoppedToLocationWithRestorationIdentifierAndDirection(location2, restorationIdentifier, direction) {
      if (this.enabled) {
        this.navigator.startVisit(location2, restorationIdentifier, {
          action: "restore",
          historyChanged: true,
          direction
        });
      } else {
        this.adapter.pageInvalidated({
          reason: "turbo_disabled"
        });
      }
    }
    // Scroll observer delegate
    scrollPositionChanged(position) {
      this.history.updateRestorationData({ scrollPosition: position });
    }
    // Form click observer delegate
    willSubmitFormLinkToLocation(link, location2) {
      return this.elementIsNavigatable(link) && locationIsVisitable(location2, this.snapshot.rootLocation);
    }
    submittedFormLinkToLocation() {
    }
    // Link hover observer delegate
    canPrefetchRequestToLocation(link, location2) {
      return this.elementIsNavigatable(link) && locationIsVisitable(location2, this.snapshot.rootLocation);
    }
    // Link click observer delegate
    willFollowLinkToLocation(link, location2, event) {
      return this.elementIsNavigatable(link) && locationIsVisitable(location2, this.snapshot.rootLocation) && this.applicationAllowsFollowingLinkToLocation(link, location2, event);
    }
    followedLinkToLocation(link, location2) {
      const action = this.getActionForLink(link);
      const acceptsStreamResponse = link.hasAttribute("data-turbo-stream");
      this.visit(location2.href, { action, acceptsStreamResponse });
    }
    // Navigator delegate
    allowsVisitingLocationWithAction(location2, action) {
      return this.locationWithActionIsSamePage(location2, action) || this.applicationAllowsVisitingLocation(location2);
    }
    visitProposedToLocation(location2, options) {
      extendURLWithDeprecatedProperties(location2);
      this.adapter.visitProposedToLocation(location2, options);
    }
    // Visit delegate
    visitStarted(visit2) {
      if (!visit2.acceptsStreamResponse) {
        markAsBusy(document.documentElement);
        this.view.markVisitDirection(visit2.direction);
      }
      extendURLWithDeprecatedProperties(visit2.location);
      if (!visit2.silent) {
        this.notifyApplicationAfterVisitingLocation(visit2.location, visit2.action);
      }
    }
    visitCompleted(visit2) {
      this.view.unmarkVisitDirection();
      clearBusyState(document.documentElement);
      this.notifyApplicationAfterPageLoad(visit2.getTimingMetrics());
    }
    locationWithActionIsSamePage(location2, action) {
      return this.navigator.locationWithActionIsSamePage(location2, action);
    }
    visitScrolledToSamePageLocation(oldURL, newURL) {
      this.notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL);
    }
    // Form submit observer delegate
    willSubmitForm(form, submitter) {
      const action = getAction$1(form, submitter);
      return this.submissionIsNavigatable(form, submitter) && locationIsVisitable(expandURL(action), this.snapshot.rootLocation);
    }
    formSubmitted(form, submitter) {
      this.navigator.submitForm(form, submitter);
    }
    // Page observer delegate
    pageBecameInteractive() {
      this.view.lastRenderedLocation = this.location;
      this.notifyApplicationAfterPageLoad();
    }
    pageLoaded() {
      this.history.assumeControlOfScrollRestoration();
    }
    pageWillUnload() {
      this.history.relinquishControlOfScrollRestoration();
    }
    // Stream observer delegate
    receivedMessageFromStream(message) {
      this.renderStreamMessage(message);
    }
    // Page view delegate
    viewWillCacheSnapshot() {
      if (!this.navigator.currentVisit?.silent) {
        this.notifyApplicationBeforeCachingSnapshot();
      }
    }
    allowsImmediateRender({ element }, options) {
      const event = this.notifyApplicationBeforeRender(element, options);
      const {
        defaultPrevented,
        detail: { render }
      } = event;
      if (this.view.renderer && render) {
        this.view.renderer.renderElement = render;
      }
      return !defaultPrevented;
    }
    viewRenderedSnapshot(_snapshot, _isPreview, renderMethod) {
      this.view.lastRenderedLocation = this.history.location;
      this.notifyApplicationAfterRender(renderMethod);
    }
    preloadOnLoadLinksForView(element) {
      this.preloader.preloadOnLoadLinksForView(element);
    }
    viewInvalidated(reason) {
      this.adapter.pageInvalidated(reason);
    }
    // Frame element
    frameLoaded(frame) {
      this.notifyApplicationAfterFrameLoad(frame);
    }
    frameRendered(fetchResponse, frame) {
      this.notifyApplicationAfterFrameRender(fetchResponse, frame);
    }
    // Application events
    applicationAllowsFollowingLinkToLocation(link, location2, ev) {
      const event = this.notifyApplicationAfterClickingLinkToLocation(link, location2, ev);
      return !event.defaultPrevented;
    }
    applicationAllowsVisitingLocation(location2) {
      const event = this.notifyApplicationBeforeVisitingLocation(location2);
      return !event.defaultPrevented;
    }
    notifyApplicationAfterClickingLinkToLocation(link, location2, event) {
      return dispatch("turbo:click", {
        target: link,
        detail: { url: location2.href, originalEvent: event },
        cancelable: true
      });
    }
    notifyApplicationBeforeVisitingLocation(location2) {
      return dispatch("turbo:before-visit", {
        detail: { url: location2.href },
        cancelable: true
      });
    }
    notifyApplicationAfterVisitingLocation(location2, action) {
      return dispatch("turbo:visit", { detail: { url: location2.href, action } });
    }
    notifyApplicationBeforeCachingSnapshot() {
      return dispatch("turbo:before-cache");
    }
    notifyApplicationBeforeRender(newBody, options) {
      return dispatch("turbo:before-render", {
        detail: { newBody, ...options },
        cancelable: true
      });
    }
    notifyApplicationAfterRender(renderMethod) {
      return dispatch("turbo:render", { detail: { renderMethod } });
    }
    notifyApplicationAfterPageLoad(timing = {}) {
      return dispatch("turbo:load", {
        detail: { url: this.location.href, timing }
      });
    }
    notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL) {
      dispatchEvent(
        new HashChangeEvent("hashchange", {
          oldURL: oldURL.toString(),
          newURL: newURL.toString()
        })
      );
    }
    notifyApplicationAfterFrameLoad(frame) {
      return dispatch("turbo:frame-load", { target: frame });
    }
    notifyApplicationAfterFrameRender(fetchResponse, frame) {
      return dispatch("turbo:frame-render", {
        detail: { fetchResponse },
        target: frame,
        cancelable: true
      });
    }
    // Helpers
    submissionIsNavigatable(form, submitter) {
      if (this.formMode == "off") {
        return false;
      } else {
        const submitterIsNavigatable = submitter ? this.elementIsNavigatable(submitter) : true;
        if (this.formMode == "optin") {
          return submitterIsNavigatable && form.closest('[data-turbo="true"]') != null;
        } else {
          return submitterIsNavigatable && this.elementIsNavigatable(form);
        }
      }
    }
    elementIsNavigatable(element) {
      const container = findClosestRecursively(element, "[data-turbo]");
      const withinFrame = findClosestRecursively(element, "turbo-frame");
      if (this.drive || withinFrame) {
        if (container) {
          return container.getAttribute("data-turbo") != "false";
        } else {
          return true;
        }
      } else {
        if (container) {
          return container.getAttribute("data-turbo") == "true";
        } else {
          return false;
        }
      }
    }
    // Private
    getActionForLink(link) {
      return getVisitAction(link) || "advance";
    }
    get snapshot() {
      return this.view.snapshot;
    }
  };
  function extendURLWithDeprecatedProperties(url) {
    Object.defineProperties(url, deprecatedLocationPropertyDescriptors);
  }
  var deprecatedLocationPropertyDescriptors = {
    absoluteURL: {
      get() {
        return this.toString();
      }
    }
  };
  var session = new Session(recentRequests);
  var { cache, navigator: navigator$1 } = session;
  function start() {
    session.start();
  }
  function registerAdapter(adapter) {
    session.registerAdapter(adapter);
  }
  function visit(location2, options) {
    session.visit(location2, options);
  }
  function connectStreamSource(source) {
    session.connectStreamSource(source);
  }
  function disconnectStreamSource(source) {
    session.disconnectStreamSource(source);
  }
  function renderStreamMessage(message) {
    session.renderStreamMessage(message);
  }
  function clearCache() {
    console.warn(
      "Please replace `Turbo.clearCache()` with `Turbo.cache.clear()`. The top-level function is deprecated and will be removed in a future version of Turbo.`"
    );
    session.clearCache();
  }
  function setProgressBarDelay(delay) {
    session.setProgressBarDelay(delay);
  }
  function setConfirmMethod(confirmMethod) {
    FormSubmission.confirmMethod = confirmMethod;
  }
  function setFormMode(mode) {
    session.setFormMode(mode);
  }
  var Turbo = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    navigator: navigator$1,
    session,
    cache,
    PageRenderer,
    PageSnapshot,
    FrameRenderer,
    fetch: fetchWithTurboHeaders,
    start,
    registerAdapter,
    visit,
    connectStreamSource,
    disconnectStreamSource,
    renderStreamMessage,
    clearCache,
    setProgressBarDelay,
    setConfirmMethod,
    setFormMode
  });
  var TurboFrameMissingError = class extends Error {
  };
  var FrameController = class {
    fetchResponseLoaded = (_fetchResponse) => Promise.resolve();
    #currentFetchRequest = null;
    #resolveVisitPromise = () => {
    };
    #connected = false;
    #hasBeenLoaded = false;
    #ignoredAttributes = /* @__PURE__ */ new Set();
    action = null;
    constructor(element) {
      this.element = element;
      this.view = new FrameView(this, this.element);
      this.appearanceObserver = new AppearanceObserver(this, this.element);
      this.formLinkClickObserver = new FormLinkClickObserver(this, this.element);
      this.linkInterceptor = new LinkInterceptor(this, this.element);
      this.restorationIdentifier = uuid();
      this.formSubmitObserver = new FormSubmitObserver(this, this.element);
    }
    // Frame delegate
    connect() {
      if (!this.#connected) {
        this.#connected = true;
        if (this.loadingStyle == FrameLoadingStyle.lazy) {
          this.appearanceObserver.start();
        } else {
          this.#loadSourceURL();
        }
        this.formLinkClickObserver.start();
        this.linkInterceptor.start();
        this.formSubmitObserver.start();
      }
    }
    disconnect() {
      if (this.#connected) {
        this.#connected = false;
        this.appearanceObserver.stop();
        this.formLinkClickObserver.stop();
        this.linkInterceptor.stop();
        this.formSubmitObserver.stop();
      }
    }
    disabledChanged() {
      if (this.loadingStyle == FrameLoadingStyle.eager) {
        this.#loadSourceURL();
      }
    }
    sourceURLChanged() {
      if (this.#isIgnoringChangesTo("src"))
        return;
      if (this.element.isConnected) {
        this.complete = false;
      }
      if (this.loadingStyle == FrameLoadingStyle.eager || this.#hasBeenLoaded) {
        this.#loadSourceURL();
      }
    }
    sourceURLReloaded() {
      const { src } = this.element;
      this.#ignoringChangesToAttribute("complete", () => {
        this.element.removeAttribute("complete");
      });
      this.element.src = null;
      this.element.src = src;
      return this.element.loaded;
    }
    completeChanged() {
      if (this.#isIgnoringChangesTo("complete"))
        return;
      this.#loadSourceURL();
    }
    loadingStyleChanged() {
      if (this.loadingStyle == FrameLoadingStyle.lazy) {
        this.appearanceObserver.start();
      } else {
        this.appearanceObserver.stop();
        this.#loadSourceURL();
      }
    }
    async #loadSourceURL() {
      if (this.enabled && this.isActive && !this.complete && this.sourceURL) {
        this.element.loaded = this.#visit(expandURL(this.sourceURL));
        this.appearanceObserver.stop();
        await this.element.loaded;
        this.#hasBeenLoaded = true;
      }
    }
    async loadResponse(fetchResponse) {
      if (fetchResponse.redirected || fetchResponse.succeeded && fetchResponse.isHTML) {
        this.sourceURL = fetchResponse.response.url;
      }
      try {
        const html = await fetchResponse.responseHTML;
        if (html) {
          const document2 = parseHTMLDocument(html);
          const pageSnapshot = PageSnapshot.fromDocument(document2);
          if (pageSnapshot.isVisitable) {
            await this.#loadFrameResponse(fetchResponse, document2);
          } else {
            await this.#handleUnvisitableFrameResponse(fetchResponse);
          }
        }
      } finally {
        this.fetchResponseLoaded = () => Promise.resolve();
      }
    }
    // Appearance observer delegate
    elementAppearedInViewport(element) {
      this.proposeVisitIfNavigatedWithAction(element, getVisitAction(element));
      this.#loadSourceURL();
    }
    // Form link click observer delegate
    willSubmitFormLinkToLocation(link) {
      return this.#shouldInterceptNavigation(link);
    }
    submittedFormLinkToLocation(link, _location, form) {
      const frame = this.#findFrameElement(link);
      if (frame)
        form.setAttribute("data-turbo-frame", frame.id);
    }
    // Link interceptor delegate
    shouldInterceptLinkClick(element, _location, _event) {
      return this.#shouldInterceptNavigation(element);
    }
    linkClickIntercepted(element, location2) {
      this.#navigateFrame(element, location2);
    }
    // Form submit observer delegate
    willSubmitForm(element, submitter) {
      return element.closest("turbo-frame") == this.element && this.#shouldInterceptNavigation(element, submitter);
    }
    formSubmitted(element, submitter) {
      if (this.formSubmission) {
        this.formSubmission.stop();
      }
      this.formSubmission = new FormSubmission(this, element, submitter);
      const { fetchRequest } = this.formSubmission;
      this.prepareRequest(fetchRequest);
      this.formSubmission.start();
    }
    // Fetch request delegate
    prepareRequest(request) {
      request.headers["Turbo-Frame"] = this.id;
      if (this.currentNavigationElement?.hasAttribute("data-turbo-stream")) {
        request.acceptResponseType(StreamMessage.contentType);
      }
    }
    requestStarted(_request) {
      markAsBusy(this.element);
    }
    requestPreventedHandlingResponse(_request, _response) {
      this.#resolveVisitPromise();
    }
    async requestSucceededWithResponse(request, response) {
      await this.loadResponse(response);
      this.#resolveVisitPromise();
    }
    async requestFailedWithResponse(request, response) {
      await this.loadResponse(response);
      this.#resolveVisitPromise();
    }
    requestErrored(request, error2) {
      console.error(error2);
      this.#resolveVisitPromise();
    }
    requestFinished(_request) {
      clearBusyState(this.element);
    }
    // Form submission delegate
    formSubmissionStarted({ formElement }) {
      markAsBusy(formElement, this.#findFrameElement(formElement));
    }
    formSubmissionSucceededWithResponse(formSubmission, response) {
      const frame = this.#findFrameElement(formSubmission.formElement, formSubmission.submitter);
      frame.delegate.proposeVisitIfNavigatedWithAction(frame, getVisitAction(formSubmission.submitter, formSubmission.formElement, frame));
      frame.delegate.loadResponse(response);
      if (!formSubmission.isSafe) {
        session.clearCache();
      }
    }
    formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
      this.element.delegate.loadResponse(fetchResponse);
      session.clearCache();
    }
    formSubmissionErrored(formSubmission, error2) {
      console.error(error2);
    }
    formSubmissionFinished({ formElement }) {
      clearBusyState(formElement, this.#findFrameElement(formElement));
    }
    // View delegate
    allowsImmediateRender({ element: newFrame }, options) {
      const event = dispatch("turbo:before-frame-render", {
        target: this.element,
        detail: { newFrame, ...options },
        cancelable: true
      });
      const {
        defaultPrevented,
        detail: { render }
      } = event;
      if (this.view.renderer && render) {
        this.view.renderer.renderElement = render;
      }
      return !defaultPrevented;
    }
    viewRenderedSnapshot(_snapshot, _isPreview, _renderMethod) {
    }
    preloadOnLoadLinksForView(element) {
      session.preloadOnLoadLinksForView(element);
    }
    viewInvalidated() {
    }
    // Frame renderer delegate
    willRenderFrame(currentElement, _newElement) {
      this.previousFrameElement = currentElement.cloneNode(true);
    }
    visitCachedSnapshot = ({ element }) => {
      const frame = element.querySelector("#" + this.element.id);
      if (frame && this.previousFrameElement) {
        frame.replaceChildren(...this.previousFrameElement.children);
      }
      delete this.previousFrameElement;
    };
    // Private
    async #loadFrameResponse(fetchResponse, document2) {
      const newFrameElement = await this.extractForeignFrameElement(document2.body);
      if (newFrameElement) {
        const snapshot = new Snapshot(newFrameElement);
        const renderer = new FrameRenderer(this, this.view.snapshot, snapshot, FrameRenderer.renderElement, false, false);
        if (this.view.renderPromise)
          await this.view.renderPromise;
        this.changeHistory();
        await this.view.render(renderer);
        this.complete = true;
        session.frameRendered(fetchResponse, this.element);
        session.frameLoaded(this.element);
        await this.fetchResponseLoaded(fetchResponse);
      } else if (this.#willHandleFrameMissingFromResponse(fetchResponse)) {
        this.#handleFrameMissingFromResponse(fetchResponse);
      }
    }
    async #visit(url) {
      const request = new FetchRequest(this, FetchMethod.get, url, new URLSearchParams(), this.element);
      this.#currentFetchRequest?.cancel();
      this.#currentFetchRequest = request;
      return new Promise((resolve) => {
        this.#resolveVisitPromise = () => {
          this.#resolveVisitPromise = () => {
          };
          this.#currentFetchRequest = null;
          resolve();
        };
        request.perform();
      });
    }
    #navigateFrame(element, url, submitter) {
      const frame = this.#findFrameElement(element, submitter);
      frame.delegate.proposeVisitIfNavigatedWithAction(frame, getVisitAction(submitter, element, frame));
      this.#withCurrentNavigationElement(element, () => {
        frame.src = url;
      });
    }
    proposeVisitIfNavigatedWithAction(frame, action = null) {
      this.action = action;
      if (this.action) {
        const pageSnapshot = PageSnapshot.fromElement(frame).clone();
        const { visitCachedSnapshot } = frame.delegate;
        frame.delegate.fetchResponseLoaded = async (fetchResponse) => {
          if (frame.src) {
            const { statusCode, redirected } = fetchResponse;
            const responseHTML = await fetchResponse.responseHTML;
            const response = { statusCode, redirected, responseHTML };
            const options = {
              response,
              visitCachedSnapshot,
              willRender: false,
              updateHistory: false,
              restorationIdentifier: this.restorationIdentifier,
              snapshot: pageSnapshot
            };
            if (this.action)
              options.action = this.action;
            session.visit(frame.src, options);
          }
        };
      }
    }
    changeHistory() {
      if (this.action) {
        const method = getHistoryMethodForAction(this.action);
        session.history.update(method, expandURL(this.element.src || ""), this.restorationIdentifier);
      }
    }
    async #handleUnvisitableFrameResponse(fetchResponse) {
      console.warn(
        `The response (${fetchResponse.statusCode}) from <turbo-frame id="${this.element.id}"> is performing a full page visit due to turbo-visit-control.`
      );
      await this.#visitResponse(fetchResponse.response);
    }
    #willHandleFrameMissingFromResponse(fetchResponse) {
      this.element.setAttribute("complete", "");
      const response = fetchResponse.response;
      const visit2 = async (url, options) => {
        if (url instanceof Response) {
          this.#visitResponse(url);
        } else {
          session.visit(url, options);
        }
      };
      const event = dispatch("turbo:frame-missing", {
        target: this.element,
        detail: { response, visit: visit2 },
        cancelable: true
      });
      return !event.defaultPrevented;
    }
    #handleFrameMissingFromResponse(fetchResponse) {
      this.view.missing();
      this.#throwFrameMissingError(fetchResponse);
    }
    #throwFrameMissingError(fetchResponse) {
      const message = `The response (${fetchResponse.statusCode}) did not contain the expected <turbo-frame id="${this.element.id}"> and will be ignored. To perform a full page visit instead, set turbo-visit-control to reload.`;
      throw new TurboFrameMissingError(message);
    }
    async #visitResponse(response) {
      const wrapped = new FetchResponse(response);
      const responseHTML = await wrapped.responseHTML;
      const { location: location2, redirected, statusCode } = wrapped;
      return session.visit(location2, { response: { redirected, statusCode, responseHTML } });
    }
    #findFrameElement(element, submitter) {
      const id = getAttribute("data-turbo-frame", submitter, element) || this.element.getAttribute("target");
      return getFrameElementById(id) ?? this.element;
    }
    async extractForeignFrameElement(container) {
      let element;
      const id = CSS.escape(this.id);
      try {
        element = activateElement(container.querySelector(`turbo-frame#${id}`), this.sourceURL);
        if (element) {
          return element;
        }
        element = activateElement(container.querySelector(`turbo-frame[src][recurse~=${id}]`), this.sourceURL);
        if (element) {
          await element.loaded;
          return await this.extractForeignFrameElement(element);
        }
      } catch (error2) {
        console.error(error2);
        return new FrameElement();
      }
      return null;
    }
    #formActionIsVisitable(form, submitter) {
      const action = getAction$1(form, submitter);
      return locationIsVisitable(expandURL(action), this.rootLocation);
    }
    #shouldInterceptNavigation(element, submitter) {
      const id = getAttribute("data-turbo-frame", submitter, element) || this.element.getAttribute("target");
      if (element instanceof HTMLFormElement && !this.#formActionIsVisitable(element, submitter)) {
        return false;
      }
      if (!this.enabled || id == "_top") {
        return false;
      }
      if (id) {
        const frameElement = getFrameElementById(id);
        if (frameElement) {
          return !frameElement.disabled;
        }
      }
      if (!session.elementIsNavigatable(element)) {
        return false;
      }
      if (submitter && !session.elementIsNavigatable(submitter)) {
        return false;
      }
      return true;
    }
    // Computed properties
    get id() {
      return this.element.id;
    }
    get enabled() {
      return !this.element.disabled;
    }
    get sourceURL() {
      if (this.element.src) {
        return this.element.src;
      }
    }
    set sourceURL(sourceURL) {
      this.#ignoringChangesToAttribute("src", () => {
        this.element.src = sourceURL ?? null;
      });
    }
    get loadingStyle() {
      return this.element.loading;
    }
    get isLoading() {
      return this.formSubmission !== void 0 || this.#resolveVisitPromise() !== void 0;
    }
    get complete() {
      return this.element.hasAttribute("complete");
    }
    set complete(value) {
      this.#ignoringChangesToAttribute("complete", () => {
        if (value) {
          this.element.setAttribute("complete", "");
        } else {
          this.element.removeAttribute("complete");
        }
      });
    }
    get isActive() {
      return this.element.isActive && this.#connected;
    }
    get rootLocation() {
      const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
      const root = meta?.content ?? "/";
      return expandURL(root);
    }
    #isIgnoringChangesTo(attributeName) {
      return this.#ignoredAttributes.has(attributeName);
    }
    #ignoringChangesToAttribute(attributeName, callback) {
      this.#ignoredAttributes.add(attributeName);
      callback();
      this.#ignoredAttributes.delete(attributeName);
    }
    #withCurrentNavigationElement(element, callback) {
      this.currentNavigationElement = element;
      callback();
      delete this.currentNavigationElement;
    }
  };
  function getFrameElementById(id) {
    if (id != null) {
      const element = document.getElementById(id);
      if (element instanceof FrameElement) {
        return element;
      }
    }
  }
  function activateElement(element, currentURL) {
    if (element) {
      const src = element.getAttribute("src");
      if (src != null && currentURL != null && urlsAreEqual(src, currentURL)) {
        throw new Error(`Matching <turbo-frame id="${element.id}"> element has a source URL which references itself`);
      }
      if (element.ownerDocument !== document) {
        element = document.importNode(element, true);
      }
      if (element instanceof FrameElement) {
        element.connectedCallback();
        element.disconnectedCallback();
        return element;
      }
    }
  }
  var StreamActions = {
    after() {
      this.targetElements.forEach((e2) => e2.parentElement?.insertBefore(this.templateContent, e2.nextSibling));
    },
    append() {
      this.removeDuplicateTargetChildren();
      this.targetElements.forEach((e2) => e2.append(this.templateContent));
    },
    before() {
      this.targetElements.forEach((e2) => e2.parentElement?.insertBefore(this.templateContent, e2));
    },
    prepend() {
      this.removeDuplicateTargetChildren();
      this.targetElements.forEach((e2) => e2.prepend(this.templateContent));
    },
    remove() {
      this.targetElements.forEach((e2) => e2.remove());
    },
    replace() {
      this.targetElements.forEach((e2) => e2.replaceWith(this.templateContent));
    },
    update() {
      this.targetElements.forEach((targetElement) => {
        targetElement.innerHTML = "";
        targetElement.append(this.templateContent);
      });
    },
    refresh() {
      session.refresh(this.baseURI, this.requestId);
    }
  };
  var StreamElement = class _StreamElement extends HTMLElement {
    static async renderElement(newElement) {
      await newElement.performAction();
    }
    async connectedCallback() {
      try {
        await this.render();
      } catch (error2) {
        console.error(error2);
      } finally {
        this.disconnect();
      }
    }
    async render() {
      return this.renderPromise ??= (async () => {
        const event = this.beforeRenderEvent;
        if (this.dispatchEvent(event)) {
          await nextRepaint();
          await event.detail.render(this);
        }
      })();
    }
    disconnect() {
      try {
        this.remove();
      } catch {
      }
    }
    /**
     * Removes duplicate children (by ID)
     */
    removeDuplicateTargetChildren() {
      this.duplicateChildren.forEach((c2) => c2.remove());
    }
    /**
     * Gets the list of duplicate children (i.e. those with the same ID)
     */
    get duplicateChildren() {
      const existingChildren = this.targetElements.flatMap((e2) => [...e2.children]).filter((c2) => !!c2.id);
      const newChildrenIds = [...this.templateContent?.children || []].filter((c2) => !!c2.id).map((c2) => c2.id);
      return existingChildren.filter((c2) => newChildrenIds.includes(c2.id));
    }
    /**
     * Gets the action function to be performed.
     */
    get performAction() {
      if (this.action) {
        const actionFunction = StreamActions[this.action];
        if (actionFunction) {
          return actionFunction;
        }
        this.#raise("unknown action");
      }
      this.#raise("action attribute is missing");
    }
    /**
     * Gets the target elements which the template will be rendered to.
     */
    get targetElements() {
      if (this.target) {
        return this.targetElementsById;
      } else if (this.targets) {
        return this.targetElementsByQuery;
      } else {
        this.#raise("target or targets attribute is missing");
      }
    }
    /**
     * Gets the contents of the main `<template>`.
     */
    get templateContent() {
      return this.templateElement.content.cloneNode(true);
    }
    /**
     * Gets the main `<template>` used for rendering
     */
    get templateElement() {
      if (this.firstElementChild === null) {
        const template = this.ownerDocument.createElement("template");
        this.appendChild(template);
        return template;
      } else if (this.firstElementChild instanceof HTMLTemplateElement) {
        return this.firstElementChild;
      }
      this.#raise("first child element must be a <template> element");
    }
    /**
     * Gets the current action.
     */
    get action() {
      return this.getAttribute("action");
    }
    /**
     * Gets the current target (an element ID) to which the result will
     * be rendered.
     */
    get target() {
      return this.getAttribute("target");
    }
    /**
     * Gets the current "targets" selector (a CSS selector)
     */
    get targets() {
      return this.getAttribute("targets");
    }
    /**
     * Reads the request-id attribute
     */
    get requestId() {
      return this.getAttribute("request-id");
    }
    #raise(message) {
      throw new Error(`${this.description}: ${message}`);
    }
    get description() {
      return (this.outerHTML.match(/<[^>]+>/) ?? [])[0] ?? "<turbo-stream>";
    }
    get beforeRenderEvent() {
      return new CustomEvent("turbo:before-stream-render", {
        bubbles: true,
        cancelable: true,
        detail: { newStream: this, render: _StreamElement.renderElement }
      });
    }
    get targetElementsById() {
      const element = this.ownerDocument?.getElementById(this.target);
      if (element !== null) {
        return [element];
      } else {
        return [];
      }
    }
    get targetElementsByQuery() {
      const elements = this.ownerDocument?.querySelectorAll(this.targets);
      if (elements.length !== 0) {
        return Array.prototype.slice.call(elements);
      } else {
        return [];
      }
    }
  };
  var StreamSourceElement = class extends HTMLElement {
    streamSource = null;
    connectedCallback() {
      this.streamSource = this.src.match(/^ws{1,2}:/) ? new WebSocket(this.src) : new EventSource(this.src);
      connectStreamSource(this.streamSource);
    }
    disconnectedCallback() {
      if (this.streamSource) {
        this.streamSource.close();
        disconnectStreamSource(this.streamSource);
      }
    }
    get src() {
      return this.getAttribute("src") || "";
    }
  };
  FrameElement.delegateConstructor = FrameController;
  if (customElements.get("turbo-frame") === void 0) {
    customElements.define("turbo-frame", FrameElement);
  }
  if (customElements.get("turbo-stream") === void 0) {
    customElements.define("turbo-stream", StreamElement);
  }
  if (customElements.get("turbo-stream-source") === void 0) {
    customElements.define("turbo-stream-source", StreamSourceElement);
  }
  (() => {
    let element = document.currentScript;
    if (!element)
      return;
    if (element.hasAttribute("data-turbo-suppress-warning"))
      return;
    element = element.parentElement;
    while (element) {
      if (element == document.body) {
        return console.warn(
          unindent`
        You are loading Turbo from a <script> element inside the <body> element. This is probably not what you meant to do!

        Load your application’s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.

        For more information, see: https://turbo.hotwired.dev/handbook/building#working-with-script-elements

        ——
        Suppress this warning by adding a "data-turbo-suppress-warning" attribute to: %s
      `,
          element.outerHTML
        );
      }
      element = element.parentElement;
    }
  })();
  window.Turbo = { ...Turbo, StreamActions };
  start();

  // node_modules/@hotwired/turbo-rails/app/javascript/turbo/cable.js
  var consumer;
  async function getConsumer() {
    return consumer || setConsumer(createConsumer2().then(setConsumer));
  }
  function setConsumer(newConsumer) {
    return consumer = newConsumer;
  }
  async function createConsumer2() {
    const { createConsumer: createConsumer3 } = await Promise.resolve().then(() => (init_src(), src_exports));
    return createConsumer3();
  }
  async function subscribeTo(channel, mixin) {
    const { subscriptions } = await getConsumer();
    return subscriptions.create(channel, mixin);
  }

  // node_modules/@hotwired/turbo-rails/app/javascript/turbo/snakeize.js
  function walk(obj) {
    if (!obj || typeof obj !== "object")
      return obj;
    if (obj instanceof Date || obj instanceof RegExp)
      return obj;
    if (Array.isArray(obj))
      return obj.map(walk);
    return Object.keys(obj).reduce(function(acc, key) {
      var camel = key[0].toLowerCase() + key.slice(1).replace(/([A-Z]+)/g, function(m2, x2) {
        return "_" + x2.toLowerCase();
      });
      acc[camel] = walk(obj[key]);
      return acc;
    }, {});
  }

  // node_modules/@hotwired/turbo-rails/app/javascript/turbo/cable_stream_source_element.js
  var TurboCableStreamSourceElement = class extends HTMLElement {
    async connectedCallback() {
      connectStreamSource(this);
      this.subscription = await subscribeTo(this.channel, {
        received: this.dispatchMessageEvent.bind(this),
        connected: this.subscriptionConnected.bind(this),
        disconnected: this.subscriptionDisconnected.bind(this)
      });
    }
    disconnectedCallback() {
      disconnectStreamSource(this);
      if (this.subscription)
        this.subscription.unsubscribe();
    }
    dispatchMessageEvent(data) {
      const event = new MessageEvent("message", { data });
      return this.dispatchEvent(event);
    }
    subscriptionConnected() {
      this.setAttribute("connected", "");
    }
    subscriptionDisconnected() {
      this.removeAttribute("connected");
    }
    get channel() {
      const channel = this.getAttribute("channel");
      const signed_stream_name = this.getAttribute("signed-stream-name");
      return { channel, signed_stream_name, ...walk({ ...this.dataset }) };
    }
  };
  if (customElements.get("turbo-cable-stream-source") === void 0) {
    customElements.define("turbo-cable-stream-source", TurboCableStreamSourceElement);
  }

  // node_modules/@hotwired/turbo-rails/app/javascript/turbo/fetch_requests.js
  function encodeMethodIntoRequestBody(event) {
    if (event.target instanceof HTMLFormElement) {
      const { target: form, detail: { fetchOptions } } = event;
      form.addEventListener("turbo:submit-start", ({ detail: { formSubmission: { submitter } } }) => {
        const body = isBodyInit(fetchOptions.body) ? fetchOptions.body : new URLSearchParams();
        const method = determineFetchMethod(submitter, body, form);
        if (!/get/i.test(method)) {
          if (/post/i.test(method)) {
            body.delete("_method");
          } else {
            body.set("_method", method);
          }
          fetchOptions.method = "post";
        }
      }, { once: true });
    }
  }
  function determineFetchMethod(submitter, body, form) {
    const formMethod = determineFormMethod(submitter);
    const overrideMethod = body.get("_method");
    const method = form.getAttribute("method") || "get";
    if (typeof formMethod == "string") {
      return formMethod;
    } else if (typeof overrideMethod == "string") {
      return overrideMethod;
    } else {
      return method;
    }
  }
  function determineFormMethod(submitter) {
    if (submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement) {
      if (submitter.name === "_method") {
        return submitter.value;
      } else if (submitter.hasAttribute("formmethod")) {
        return submitter.formMethod;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
  function isBodyInit(body) {
    return body instanceof FormData || body instanceof URLSearchParams;
  }

  // node_modules/@hotwired/turbo-rails/app/javascript/turbo/index.js
  window.Turbo = turbo_es2017_esm_exports;
  addEventListener("turbo:before-fetch-request", encodeMethodIntoRequestBody);

  // node_modules/@hotwired/stimulus/dist/stimulus.js
  var EventListener = class {
    constructor(eventTarget, eventName, eventOptions) {
      this.eventTarget = eventTarget;
      this.eventName = eventName;
      this.eventOptions = eventOptions;
      this.unorderedBindings = /* @__PURE__ */ new Set();
    }
    connect() {
      this.eventTarget.addEventListener(this.eventName, this, this.eventOptions);
    }
    disconnect() {
      this.eventTarget.removeEventListener(this.eventName, this, this.eventOptions);
    }
    bindingConnected(binding) {
      this.unorderedBindings.add(binding);
    }
    bindingDisconnected(binding) {
      this.unorderedBindings.delete(binding);
    }
    handleEvent(event) {
      const extendedEvent = extendEvent(event);
      for (const binding of this.bindings) {
        if (extendedEvent.immediatePropagationStopped) {
          break;
        } else {
          binding.handleEvent(extendedEvent);
        }
      }
    }
    hasBindings() {
      return this.unorderedBindings.size > 0;
    }
    get bindings() {
      return Array.from(this.unorderedBindings).sort((left, right) => {
        const leftIndex = left.index, rightIndex = right.index;
        return leftIndex < rightIndex ? -1 : leftIndex > rightIndex ? 1 : 0;
      });
    }
  };
  function extendEvent(event) {
    if ("immediatePropagationStopped" in event) {
      return event;
    } else {
      const { stopImmediatePropagation } = event;
      return Object.assign(event, {
        immediatePropagationStopped: false,
        stopImmediatePropagation() {
          this.immediatePropagationStopped = true;
          stopImmediatePropagation.call(this);
        }
      });
    }
  }
  var Dispatcher = class {
    constructor(application2) {
      this.application = application2;
      this.eventListenerMaps = /* @__PURE__ */ new Map();
      this.started = false;
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.eventListeners.forEach((eventListener) => eventListener.connect());
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        this.eventListeners.forEach((eventListener) => eventListener.disconnect());
      }
    }
    get eventListeners() {
      return Array.from(this.eventListenerMaps.values()).reduce((listeners, map) => listeners.concat(Array.from(map.values())), []);
    }
    bindingConnected(binding) {
      this.fetchEventListenerForBinding(binding).bindingConnected(binding);
    }
    bindingDisconnected(binding, clearEventListeners = false) {
      this.fetchEventListenerForBinding(binding).bindingDisconnected(binding);
      if (clearEventListeners)
        this.clearEventListenersForBinding(binding);
    }
    handleError(error2, message, detail = {}) {
      this.application.handleError(error2, `Error ${message}`, detail);
    }
    clearEventListenersForBinding(binding) {
      const eventListener = this.fetchEventListenerForBinding(binding);
      if (!eventListener.hasBindings()) {
        eventListener.disconnect();
        this.removeMappedEventListenerFor(binding);
      }
    }
    removeMappedEventListenerFor(binding) {
      const { eventTarget, eventName, eventOptions } = binding;
      const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
      const cacheKey = this.cacheKey(eventName, eventOptions);
      eventListenerMap.delete(cacheKey);
      if (eventListenerMap.size == 0)
        this.eventListenerMaps.delete(eventTarget);
    }
    fetchEventListenerForBinding(binding) {
      const { eventTarget, eventName, eventOptions } = binding;
      return this.fetchEventListener(eventTarget, eventName, eventOptions);
    }
    fetchEventListener(eventTarget, eventName, eventOptions) {
      const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
      const cacheKey = this.cacheKey(eventName, eventOptions);
      let eventListener = eventListenerMap.get(cacheKey);
      if (!eventListener) {
        eventListener = this.createEventListener(eventTarget, eventName, eventOptions);
        eventListenerMap.set(cacheKey, eventListener);
      }
      return eventListener;
    }
    createEventListener(eventTarget, eventName, eventOptions) {
      const eventListener = new EventListener(eventTarget, eventName, eventOptions);
      if (this.started) {
        eventListener.connect();
      }
      return eventListener;
    }
    fetchEventListenerMapForEventTarget(eventTarget) {
      let eventListenerMap = this.eventListenerMaps.get(eventTarget);
      if (!eventListenerMap) {
        eventListenerMap = /* @__PURE__ */ new Map();
        this.eventListenerMaps.set(eventTarget, eventListenerMap);
      }
      return eventListenerMap;
    }
    cacheKey(eventName, eventOptions) {
      const parts = [eventName];
      Object.keys(eventOptions).sort().forEach((key) => {
        parts.push(`${eventOptions[key] ? "" : "!"}${key}`);
      });
      return parts.join(":");
    }
  };
  var defaultActionDescriptorFilters = {
    stop({ event, value }) {
      if (value)
        event.stopPropagation();
      return true;
    },
    prevent({ event, value }) {
      if (value)
        event.preventDefault();
      return true;
    },
    self({ event, value, element }) {
      if (value) {
        return element === event.target;
      } else {
        return true;
      }
    }
  };
  var descriptorPattern = /^(?:(?:([^.]+?)\+)?(.+?)(?:\.(.+?))?(?:@(window|document))?->)?(.+?)(?:#([^:]+?))(?::(.+))?$/;
  function parseActionDescriptorString(descriptorString) {
    const source = descriptorString.trim();
    const matches = source.match(descriptorPattern) || [];
    let eventName = matches[2];
    let keyFilter = matches[3];
    if (keyFilter && !["keydown", "keyup", "keypress"].includes(eventName)) {
      eventName += `.${keyFilter}`;
      keyFilter = "";
    }
    return {
      eventTarget: parseEventTarget(matches[4]),
      eventName,
      eventOptions: matches[7] ? parseEventOptions(matches[7]) : {},
      identifier: matches[5],
      methodName: matches[6],
      keyFilter: matches[1] || keyFilter
    };
  }
  function parseEventTarget(eventTargetName) {
    if (eventTargetName == "window") {
      return window;
    } else if (eventTargetName == "document") {
      return document;
    }
  }
  function parseEventOptions(eventOptions) {
    return eventOptions.split(":").reduce((options, token) => Object.assign(options, { [token.replace(/^!/, "")]: !/^!/.test(token) }), {});
  }
  function stringifyEventTarget(eventTarget) {
    if (eventTarget == window) {
      return "window";
    } else if (eventTarget == document) {
      return "document";
    }
  }
  function camelize(value) {
    return value.replace(/(?:[_-])([a-z0-9])/g, (_2, char) => char.toUpperCase());
  }
  function namespaceCamelize(value) {
    return camelize(value.replace(/--/g, "-").replace(/__/g, "_"));
  }
  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  function dasherize(value) {
    return value.replace(/([A-Z])/g, (_2, char) => `-${char.toLowerCase()}`);
  }
  function tokenize(value) {
    return value.match(/[^\s]+/g) || [];
  }
  function isSomething(object) {
    return object !== null && object !== void 0;
  }
  function hasProperty(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  }
  var allModifiers = ["meta", "ctrl", "alt", "shift"];
  var Action = class {
    constructor(element, index, descriptor, schema) {
      this.element = element;
      this.index = index;
      this.eventTarget = descriptor.eventTarget || element;
      this.eventName = descriptor.eventName || getDefaultEventNameForElement(element) || error("missing event name");
      this.eventOptions = descriptor.eventOptions || {};
      this.identifier = descriptor.identifier || error("missing identifier");
      this.methodName = descriptor.methodName || error("missing method name");
      this.keyFilter = descriptor.keyFilter || "";
      this.schema = schema;
    }
    static forToken(token, schema) {
      return new this(token.element, token.index, parseActionDescriptorString(token.content), schema);
    }
    toString() {
      const eventFilter = this.keyFilter ? `.${this.keyFilter}` : "";
      const eventTarget = this.eventTargetName ? `@${this.eventTargetName}` : "";
      return `${this.eventName}${eventFilter}${eventTarget}->${this.identifier}#${this.methodName}`;
    }
    shouldIgnoreKeyboardEvent(event) {
      if (!this.keyFilter) {
        return false;
      }
      const filters = this.keyFilter.split("+");
      if (this.keyFilterDissatisfied(event, filters)) {
        return true;
      }
      const standardFilter = filters.filter((key) => !allModifiers.includes(key))[0];
      if (!standardFilter) {
        return false;
      }
      if (!hasProperty(this.keyMappings, standardFilter)) {
        error(`contains unknown key filter: ${this.keyFilter}`);
      }
      return this.keyMappings[standardFilter].toLowerCase() !== event.key.toLowerCase();
    }
    shouldIgnoreMouseEvent(event) {
      if (!this.keyFilter) {
        return false;
      }
      const filters = [this.keyFilter];
      if (this.keyFilterDissatisfied(event, filters)) {
        return true;
      }
      return false;
    }
    get params() {
      const params = {};
      const pattern = new RegExp(`^data-${this.identifier}-(.+)-param$`, "i");
      for (const { name, value } of Array.from(this.element.attributes)) {
        const match = name.match(pattern);
        const key = match && match[1];
        if (key) {
          params[camelize(key)] = typecast(value);
        }
      }
      return params;
    }
    get eventTargetName() {
      return stringifyEventTarget(this.eventTarget);
    }
    get keyMappings() {
      return this.schema.keyMappings;
    }
    keyFilterDissatisfied(event, filters) {
      const [meta, ctrl, alt, shift] = allModifiers.map((modifier) => filters.includes(modifier));
      return event.metaKey !== meta || event.ctrlKey !== ctrl || event.altKey !== alt || event.shiftKey !== shift;
    }
  };
  var defaultEventNames = {
    a: () => "click",
    button: () => "click",
    form: () => "submit",
    details: () => "toggle",
    input: (e2) => e2.getAttribute("type") == "submit" ? "click" : "input",
    select: () => "change",
    textarea: () => "input"
  };
  function getDefaultEventNameForElement(element) {
    const tagName = element.tagName.toLowerCase();
    if (tagName in defaultEventNames) {
      return defaultEventNames[tagName](element);
    }
  }
  function error(message) {
    throw new Error(message);
  }
  function typecast(value) {
    try {
      return JSON.parse(value);
    } catch (o_O) {
      return value;
    }
  }
  var Binding = class {
    constructor(context, action) {
      this.context = context;
      this.action = action;
    }
    get index() {
      return this.action.index;
    }
    get eventTarget() {
      return this.action.eventTarget;
    }
    get eventOptions() {
      return this.action.eventOptions;
    }
    get identifier() {
      return this.context.identifier;
    }
    handleEvent(event) {
      const actionEvent = this.prepareActionEvent(event);
      if (this.willBeInvokedByEvent(event) && this.applyEventModifiers(actionEvent)) {
        this.invokeWithEvent(actionEvent);
      }
    }
    get eventName() {
      return this.action.eventName;
    }
    get method() {
      const method = this.controller[this.methodName];
      if (typeof method == "function") {
        return method;
      }
      throw new Error(`Action "${this.action}" references undefined method "${this.methodName}"`);
    }
    applyEventModifiers(event) {
      const { element } = this.action;
      const { actionDescriptorFilters } = this.context.application;
      const { controller } = this.context;
      let passes = true;
      for (const [name, value] of Object.entries(this.eventOptions)) {
        if (name in actionDescriptorFilters) {
          const filter = actionDescriptorFilters[name];
          passes = passes && filter({ name, value, event, element, controller });
        } else {
          continue;
        }
      }
      return passes;
    }
    prepareActionEvent(event) {
      return Object.assign(event, { params: this.action.params });
    }
    invokeWithEvent(event) {
      const { target, currentTarget } = event;
      try {
        this.method.call(this.controller, event);
        this.context.logDebugActivity(this.methodName, { event, target, currentTarget, action: this.methodName });
      } catch (error2) {
        const { identifier, controller, element, index } = this;
        const detail = { identifier, controller, element, index, event };
        this.context.handleError(error2, `invoking action "${this.action}"`, detail);
      }
    }
    willBeInvokedByEvent(event) {
      const eventTarget = event.target;
      if (event instanceof KeyboardEvent && this.action.shouldIgnoreKeyboardEvent(event)) {
        return false;
      }
      if (event instanceof MouseEvent && this.action.shouldIgnoreMouseEvent(event)) {
        return false;
      }
      if (this.element === eventTarget) {
        return true;
      } else if (eventTarget instanceof Element && this.element.contains(eventTarget)) {
        return this.scope.containsElement(eventTarget);
      } else {
        return this.scope.containsElement(this.action.element);
      }
    }
    get controller() {
      return this.context.controller;
    }
    get methodName() {
      return this.action.methodName;
    }
    get element() {
      return this.scope.element;
    }
    get scope() {
      return this.context.scope;
    }
  };
  var ElementObserver = class {
    constructor(element, delegate) {
      this.mutationObserverInit = { attributes: true, childList: true, subtree: true };
      this.element = element;
      this.started = false;
      this.delegate = delegate;
      this.elements = /* @__PURE__ */ new Set();
      this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.mutationObserver.observe(this.element, this.mutationObserverInit);
        this.refresh();
      }
    }
    pause(callback) {
      if (this.started) {
        this.mutationObserver.disconnect();
        this.started = false;
      }
      callback();
      if (!this.started) {
        this.mutationObserver.observe(this.element, this.mutationObserverInit);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        this.mutationObserver.takeRecords();
        this.mutationObserver.disconnect();
        this.started = false;
      }
    }
    refresh() {
      if (this.started) {
        const matches = new Set(this.matchElementsInTree());
        for (const element of Array.from(this.elements)) {
          if (!matches.has(element)) {
            this.removeElement(element);
          }
        }
        for (const element of Array.from(matches)) {
          this.addElement(element);
        }
      }
    }
    processMutations(mutations) {
      if (this.started) {
        for (const mutation of mutations) {
          this.processMutation(mutation);
        }
      }
    }
    processMutation(mutation) {
      if (mutation.type == "attributes") {
        this.processAttributeChange(mutation.target, mutation.attributeName);
      } else if (mutation.type == "childList") {
        this.processRemovedNodes(mutation.removedNodes);
        this.processAddedNodes(mutation.addedNodes);
      }
    }
    processAttributeChange(element, attributeName) {
      if (this.elements.has(element)) {
        if (this.delegate.elementAttributeChanged && this.matchElement(element)) {
          this.delegate.elementAttributeChanged(element, attributeName);
        } else {
          this.removeElement(element);
        }
      } else if (this.matchElement(element)) {
        this.addElement(element);
      }
    }
    processRemovedNodes(nodes) {
      for (const node of Array.from(nodes)) {
        const element = this.elementFromNode(node);
        if (element) {
          this.processTree(element, this.removeElement);
        }
      }
    }
    processAddedNodes(nodes) {
      for (const node of Array.from(nodes)) {
        const element = this.elementFromNode(node);
        if (element && this.elementIsActive(element)) {
          this.processTree(element, this.addElement);
        }
      }
    }
    matchElement(element) {
      return this.delegate.matchElement(element);
    }
    matchElementsInTree(tree = this.element) {
      return this.delegate.matchElementsInTree(tree);
    }
    processTree(tree, processor) {
      for (const element of this.matchElementsInTree(tree)) {
        processor.call(this, element);
      }
    }
    elementFromNode(node) {
      if (node.nodeType == Node.ELEMENT_NODE) {
        return node;
      }
    }
    elementIsActive(element) {
      if (element.isConnected != this.element.isConnected) {
        return false;
      } else {
        return this.element.contains(element);
      }
    }
    addElement(element) {
      if (!this.elements.has(element)) {
        if (this.elementIsActive(element)) {
          this.elements.add(element);
          if (this.delegate.elementMatched) {
            this.delegate.elementMatched(element);
          }
        }
      }
    }
    removeElement(element) {
      if (this.elements.has(element)) {
        this.elements.delete(element);
        if (this.delegate.elementUnmatched) {
          this.delegate.elementUnmatched(element);
        }
      }
    }
  };
  var AttributeObserver = class {
    constructor(element, attributeName, delegate) {
      this.attributeName = attributeName;
      this.delegate = delegate;
      this.elementObserver = new ElementObserver(element, this);
    }
    get element() {
      return this.elementObserver.element;
    }
    get selector() {
      return `[${this.attributeName}]`;
    }
    start() {
      this.elementObserver.start();
    }
    pause(callback) {
      this.elementObserver.pause(callback);
    }
    stop() {
      this.elementObserver.stop();
    }
    refresh() {
      this.elementObserver.refresh();
    }
    get started() {
      return this.elementObserver.started;
    }
    matchElement(element) {
      return element.hasAttribute(this.attributeName);
    }
    matchElementsInTree(tree) {
      const match = this.matchElement(tree) ? [tree] : [];
      const matches = Array.from(tree.querySelectorAll(this.selector));
      return match.concat(matches);
    }
    elementMatched(element) {
      if (this.delegate.elementMatchedAttribute) {
        this.delegate.elementMatchedAttribute(element, this.attributeName);
      }
    }
    elementUnmatched(element) {
      if (this.delegate.elementUnmatchedAttribute) {
        this.delegate.elementUnmatchedAttribute(element, this.attributeName);
      }
    }
    elementAttributeChanged(element, attributeName) {
      if (this.delegate.elementAttributeValueChanged && this.attributeName == attributeName) {
        this.delegate.elementAttributeValueChanged(element, attributeName);
      }
    }
  };
  function add(map, key, value) {
    fetch(map, key).add(value);
  }
  function del(map, key, value) {
    fetch(map, key).delete(value);
    prune(map, key);
  }
  function fetch(map, key) {
    let values = map.get(key);
    if (!values) {
      values = /* @__PURE__ */ new Set();
      map.set(key, values);
    }
    return values;
  }
  function prune(map, key) {
    const values = map.get(key);
    if (values != null && values.size == 0) {
      map.delete(key);
    }
  }
  var Multimap = class {
    constructor() {
      this.valuesByKey = /* @__PURE__ */ new Map();
    }
    get keys() {
      return Array.from(this.valuesByKey.keys());
    }
    get values() {
      const sets = Array.from(this.valuesByKey.values());
      return sets.reduce((values, set) => values.concat(Array.from(set)), []);
    }
    get size() {
      const sets = Array.from(this.valuesByKey.values());
      return sets.reduce((size, set) => size + set.size, 0);
    }
    add(key, value) {
      add(this.valuesByKey, key, value);
    }
    delete(key, value) {
      del(this.valuesByKey, key, value);
    }
    has(key, value) {
      const values = this.valuesByKey.get(key);
      return values != null && values.has(value);
    }
    hasKey(key) {
      return this.valuesByKey.has(key);
    }
    hasValue(value) {
      const sets = Array.from(this.valuesByKey.values());
      return sets.some((set) => set.has(value));
    }
    getValuesForKey(key) {
      const values = this.valuesByKey.get(key);
      return values ? Array.from(values) : [];
    }
    getKeysForValue(value) {
      return Array.from(this.valuesByKey).filter(([_key, values]) => values.has(value)).map(([key, _values]) => key);
    }
  };
  var SelectorObserver = class {
    constructor(element, selector, delegate, details) {
      this._selector = selector;
      this.details = details;
      this.elementObserver = new ElementObserver(element, this);
      this.delegate = delegate;
      this.matchesByElement = new Multimap();
    }
    get started() {
      return this.elementObserver.started;
    }
    get selector() {
      return this._selector;
    }
    set selector(selector) {
      this._selector = selector;
      this.refresh();
    }
    start() {
      this.elementObserver.start();
    }
    pause(callback) {
      this.elementObserver.pause(callback);
    }
    stop() {
      this.elementObserver.stop();
    }
    refresh() {
      this.elementObserver.refresh();
    }
    get element() {
      return this.elementObserver.element;
    }
    matchElement(element) {
      const { selector } = this;
      if (selector) {
        const matches = element.matches(selector);
        if (this.delegate.selectorMatchElement) {
          return matches && this.delegate.selectorMatchElement(element, this.details);
        }
        return matches;
      } else {
        return false;
      }
    }
    matchElementsInTree(tree) {
      const { selector } = this;
      if (selector) {
        const match = this.matchElement(tree) ? [tree] : [];
        const matches = Array.from(tree.querySelectorAll(selector)).filter((match2) => this.matchElement(match2));
        return match.concat(matches);
      } else {
        return [];
      }
    }
    elementMatched(element) {
      const { selector } = this;
      if (selector) {
        this.selectorMatched(element, selector);
      }
    }
    elementUnmatched(element) {
      const selectors = this.matchesByElement.getKeysForValue(element);
      for (const selector of selectors) {
        this.selectorUnmatched(element, selector);
      }
    }
    elementAttributeChanged(element, _attributeName) {
      const { selector } = this;
      if (selector) {
        const matches = this.matchElement(element);
        const matchedBefore = this.matchesByElement.has(selector, element);
        if (matches && !matchedBefore) {
          this.selectorMatched(element, selector);
        } else if (!matches && matchedBefore) {
          this.selectorUnmatched(element, selector);
        }
      }
    }
    selectorMatched(element, selector) {
      this.delegate.selectorMatched(element, selector, this.details);
      this.matchesByElement.add(selector, element);
    }
    selectorUnmatched(element, selector) {
      this.delegate.selectorUnmatched(element, selector, this.details);
      this.matchesByElement.delete(selector, element);
    }
  };
  var StringMapObserver = class {
    constructor(element, delegate) {
      this.element = element;
      this.delegate = delegate;
      this.started = false;
      this.stringMap = /* @__PURE__ */ new Map();
      this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.mutationObserver.observe(this.element, { attributes: true, attributeOldValue: true });
        this.refresh();
      }
    }
    stop() {
      if (this.started) {
        this.mutationObserver.takeRecords();
        this.mutationObserver.disconnect();
        this.started = false;
      }
    }
    refresh() {
      if (this.started) {
        for (const attributeName of this.knownAttributeNames) {
          this.refreshAttribute(attributeName, null);
        }
      }
    }
    processMutations(mutations) {
      if (this.started) {
        for (const mutation of mutations) {
          this.processMutation(mutation);
        }
      }
    }
    processMutation(mutation) {
      const attributeName = mutation.attributeName;
      if (attributeName) {
        this.refreshAttribute(attributeName, mutation.oldValue);
      }
    }
    refreshAttribute(attributeName, oldValue) {
      const key = this.delegate.getStringMapKeyForAttribute(attributeName);
      if (key != null) {
        if (!this.stringMap.has(attributeName)) {
          this.stringMapKeyAdded(key, attributeName);
        }
        const value = this.element.getAttribute(attributeName);
        if (this.stringMap.get(attributeName) != value) {
          this.stringMapValueChanged(value, key, oldValue);
        }
        if (value == null) {
          const oldValue2 = this.stringMap.get(attributeName);
          this.stringMap.delete(attributeName);
          if (oldValue2)
            this.stringMapKeyRemoved(key, attributeName, oldValue2);
        } else {
          this.stringMap.set(attributeName, value);
        }
      }
    }
    stringMapKeyAdded(key, attributeName) {
      if (this.delegate.stringMapKeyAdded) {
        this.delegate.stringMapKeyAdded(key, attributeName);
      }
    }
    stringMapValueChanged(value, key, oldValue) {
      if (this.delegate.stringMapValueChanged) {
        this.delegate.stringMapValueChanged(value, key, oldValue);
      }
    }
    stringMapKeyRemoved(key, attributeName, oldValue) {
      if (this.delegate.stringMapKeyRemoved) {
        this.delegate.stringMapKeyRemoved(key, attributeName, oldValue);
      }
    }
    get knownAttributeNames() {
      return Array.from(new Set(this.currentAttributeNames.concat(this.recordedAttributeNames)));
    }
    get currentAttributeNames() {
      return Array.from(this.element.attributes).map((attribute) => attribute.name);
    }
    get recordedAttributeNames() {
      return Array.from(this.stringMap.keys());
    }
  };
  var TokenListObserver = class {
    constructor(element, attributeName, delegate) {
      this.attributeObserver = new AttributeObserver(element, attributeName, this);
      this.delegate = delegate;
      this.tokensByElement = new Multimap();
    }
    get started() {
      return this.attributeObserver.started;
    }
    start() {
      this.attributeObserver.start();
    }
    pause(callback) {
      this.attributeObserver.pause(callback);
    }
    stop() {
      this.attributeObserver.stop();
    }
    refresh() {
      this.attributeObserver.refresh();
    }
    get element() {
      return this.attributeObserver.element;
    }
    get attributeName() {
      return this.attributeObserver.attributeName;
    }
    elementMatchedAttribute(element) {
      this.tokensMatched(this.readTokensForElement(element));
    }
    elementAttributeValueChanged(element) {
      const [unmatchedTokens, matchedTokens] = this.refreshTokensForElement(element);
      this.tokensUnmatched(unmatchedTokens);
      this.tokensMatched(matchedTokens);
    }
    elementUnmatchedAttribute(element) {
      this.tokensUnmatched(this.tokensByElement.getValuesForKey(element));
    }
    tokensMatched(tokens) {
      tokens.forEach((token) => this.tokenMatched(token));
    }
    tokensUnmatched(tokens) {
      tokens.forEach((token) => this.tokenUnmatched(token));
    }
    tokenMatched(token) {
      this.delegate.tokenMatched(token);
      this.tokensByElement.add(token.element, token);
    }
    tokenUnmatched(token) {
      this.delegate.tokenUnmatched(token);
      this.tokensByElement.delete(token.element, token);
    }
    refreshTokensForElement(element) {
      const previousTokens = this.tokensByElement.getValuesForKey(element);
      const currentTokens = this.readTokensForElement(element);
      const firstDifferingIndex = zip(previousTokens, currentTokens).findIndex(([previousToken, currentToken]) => !tokensAreEqual(previousToken, currentToken));
      if (firstDifferingIndex == -1) {
        return [[], []];
      } else {
        return [previousTokens.slice(firstDifferingIndex), currentTokens.slice(firstDifferingIndex)];
      }
    }
    readTokensForElement(element) {
      const attributeName = this.attributeName;
      const tokenString = element.getAttribute(attributeName) || "";
      return parseTokenString(tokenString, element, attributeName);
    }
  };
  function parseTokenString(tokenString, element, attributeName) {
    return tokenString.trim().split(/\s+/).filter((content) => content.length).map((content, index) => ({ element, attributeName, content, index }));
  }
  function zip(left, right) {
    const length = Math.max(left.length, right.length);
    return Array.from({ length }, (_2, index) => [left[index], right[index]]);
  }
  function tokensAreEqual(left, right) {
    return left && right && left.index == right.index && left.content == right.content;
  }
  var ValueListObserver = class {
    constructor(element, attributeName, delegate) {
      this.tokenListObserver = new TokenListObserver(element, attributeName, this);
      this.delegate = delegate;
      this.parseResultsByToken = /* @__PURE__ */ new WeakMap();
      this.valuesByTokenByElement = /* @__PURE__ */ new WeakMap();
    }
    get started() {
      return this.tokenListObserver.started;
    }
    start() {
      this.tokenListObserver.start();
    }
    stop() {
      this.tokenListObserver.stop();
    }
    refresh() {
      this.tokenListObserver.refresh();
    }
    get element() {
      return this.tokenListObserver.element;
    }
    get attributeName() {
      return this.tokenListObserver.attributeName;
    }
    tokenMatched(token) {
      const { element } = token;
      const { value } = this.fetchParseResultForToken(token);
      if (value) {
        this.fetchValuesByTokenForElement(element).set(token, value);
        this.delegate.elementMatchedValue(element, value);
      }
    }
    tokenUnmatched(token) {
      const { element } = token;
      const { value } = this.fetchParseResultForToken(token);
      if (value) {
        this.fetchValuesByTokenForElement(element).delete(token);
        this.delegate.elementUnmatchedValue(element, value);
      }
    }
    fetchParseResultForToken(token) {
      let parseResult = this.parseResultsByToken.get(token);
      if (!parseResult) {
        parseResult = this.parseToken(token);
        this.parseResultsByToken.set(token, parseResult);
      }
      return parseResult;
    }
    fetchValuesByTokenForElement(element) {
      let valuesByToken = this.valuesByTokenByElement.get(element);
      if (!valuesByToken) {
        valuesByToken = /* @__PURE__ */ new Map();
        this.valuesByTokenByElement.set(element, valuesByToken);
      }
      return valuesByToken;
    }
    parseToken(token) {
      try {
        const value = this.delegate.parseValueForToken(token);
        return { value };
      } catch (error2) {
        return { error: error2 };
      }
    }
  };
  var BindingObserver = class {
    constructor(context, delegate) {
      this.context = context;
      this.delegate = delegate;
      this.bindingsByAction = /* @__PURE__ */ new Map();
    }
    start() {
      if (!this.valueListObserver) {
        this.valueListObserver = new ValueListObserver(this.element, this.actionAttribute, this);
        this.valueListObserver.start();
      }
    }
    stop() {
      if (this.valueListObserver) {
        this.valueListObserver.stop();
        delete this.valueListObserver;
        this.disconnectAllActions();
      }
    }
    get element() {
      return this.context.element;
    }
    get identifier() {
      return this.context.identifier;
    }
    get actionAttribute() {
      return this.schema.actionAttribute;
    }
    get schema() {
      return this.context.schema;
    }
    get bindings() {
      return Array.from(this.bindingsByAction.values());
    }
    connectAction(action) {
      const binding = new Binding(this.context, action);
      this.bindingsByAction.set(action, binding);
      this.delegate.bindingConnected(binding);
    }
    disconnectAction(action) {
      const binding = this.bindingsByAction.get(action);
      if (binding) {
        this.bindingsByAction.delete(action);
        this.delegate.bindingDisconnected(binding);
      }
    }
    disconnectAllActions() {
      this.bindings.forEach((binding) => this.delegate.bindingDisconnected(binding, true));
      this.bindingsByAction.clear();
    }
    parseValueForToken(token) {
      const action = Action.forToken(token, this.schema);
      if (action.identifier == this.identifier) {
        return action;
      }
    }
    elementMatchedValue(element, action) {
      this.connectAction(action);
    }
    elementUnmatchedValue(element, action) {
      this.disconnectAction(action);
    }
  };
  var ValueObserver = class {
    constructor(context, receiver) {
      this.context = context;
      this.receiver = receiver;
      this.stringMapObserver = new StringMapObserver(this.element, this);
      this.valueDescriptorMap = this.controller.valueDescriptorMap;
    }
    start() {
      this.stringMapObserver.start();
      this.invokeChangedCallbacksForDefaultValues();
    }
    stop() {
      this.stringMapObserver.stop();
    }
    get element() {
      return this.context.element;
    }
    get controller() {
      return this.context.controller;
    }
    getStringMapKeyForAttribute(attributeName) {
      if (attributeName in this.valueDescriptorMap) {
        return this.valueDescriptorMap[attributeName].name;
      }
    }
    stringMapKeyAdded(key, attributeName) {
      const descriptor = this.valueDescriptorMap[attributeName];
      if (!this.hasValue(key)) {
        this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), descriptor.writer(descriptor.defaultValue));
      }
    }
    stringMapValueChanged(value, name, oldValue) {
      const descriptor = this.valueDescriptorNameMap[name];
      if (value === null)
        return;
      if (oldValue === null) {
        oldValue = descriptor.writer(descriptor.defaultValue);
      }
      this.invokeChangedCallback(name, value, oldValue);
    }
    stringMapKeyRemoved(key, attributeName, oldValue) {
      const descriptor = this.valueDescriptorNameMap[key];
      if (this.hasValue(key)) {
        this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), oldValue);
      } else {
        this.invokeChangedCallback(key, descriptor.writer(descriptor.defaultValue), oldValue);
      }
    }
    invokeChangedCallbacksForDefaultValues() {
      for (const { key, name, defaultValue, writer } of this.valueDescriptors) {
        if (defaultValue != void 0 && !this.controller.data.has(key)) {
          this.invokeChangedCallback(name, writer(defaultValue), void 0);
        }
      }
    }
    invokeChangedCallback(name, rawValue, rawOldValue) {
      const changedMethodName = `${name}Changed`;
      const changedMethod = this.receiver[changedMethodName];
      if (typeof changedMethod == "function") {
        const descriptor = this.valueDescriptorNameMap[name];
        try {
          const value = descriptor.reader(rawValue);
          let oldValue = rawOldValue;
          if (rawOldValue) {
            oldValue = descriptor.reader(rawOldValue);
          }
          changedMethod.call(this.receiver, value, oldValue);
        } catch (error2) {
          if (error2 instanceof TypeError) {
            error2.message = `Stimulus Value "${this.context.identifier}.${descriptor.name}" - ${error2.message}`;
          }
          throw error2;
        }
      }
    }
    get valueDescriptors() {
      const { valueDescriptorMap } = this;
      return Object.keys(valueDescriptorMap).map((key) => valueDescriptorMap[key]);
    }
    get valueDescriptorNameMap() {
      const descriptors = {};
      Object.keys(this.valueDescriptorMap).forEach((key) => {
        const descriptor = this.valueDescriptorMap[key];
        descriptors[descriptor.name] = descriptor;
      });
      return descriptors;
    }
    hasValue(attributeName) {
      const descriptor = this.valueDescriptorNameMap[attributeName];
      const hasMethodName = `has${capitalize(descriptor.name)}`;
      return this.receiver[hasMethodName];
    }
  };
  var TargetObserver = class {
    constructor(context, delegate) {
      this.context = context;
      this.delegate = delegate;
      this.targetsByName = new Multimap();
    }
    start() {
      if (!this.tokenListObserver) {
        this.tokenListObserver = new TokenListObserver(this.element, this.attributeName, this);
        this.tokenListObserver.start();
      }
    }
    stop() {
      if (this.tokenListObserver) {
        this.disconnectAllTargets();
        this.tokenListObserver.stop();
        delete this.tokenListObserver;
      }
    }
    tokenMatched({ element, content: name }) {
      if (this.scope.containsElement(element)) {
        this.connectTarget(element, name);
      }
    }
    tokenUnmatched({ element, content: name }) {
      this.disconnectTarget(element, name);
    }
    connectTarget(element, name) {
      var _a;
      if (!this.targetsByName.has(name, element)) {
        this.targetsByName.add(name, element);
        (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetConnected(element, name));
      }
    }
    disconnectTarget(element, name) {
      var _a;
      if (this.targetsByName.has(name, element)) {
        this.targetsByName.delete(name, element);
        (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetDisconnected(element, name));
      }
    }
    disconnectAllTargets() {
      for (const name of this.targetsByName.keys) {
        for (const element of this.targetsByName.getValuesForKey(name)) {
          this.disconnectTarget(element, name);
        }
      }
    }
    get attributeName() {
      return `data-${this.context.identifier}-target`;
    }
    get element() {
      return this.context.element;
    }
    get scope() {
      return this.context.scope;
    }
  };
  function readInheritableStaticArrayValues(constructor, propertyName) {
    const ancestors = getAncestorsForConstructor(constructor);
    return Array.from(ancestors.reduce((values, constructor2) => {
      getOwnStaticArrayValues(constructor2, propertyName).forEach((name) => values.add(name));
      return values;
    }, /* @__PURE__ */ new Set()));
  }
  function readInheritableStaticObjectPairs(constructor, propertyName) {
    const ancestors = getAncestorsForConstructor(constructor);
    return ancestors.reduce((pairs, constructor2) => {
      pairs.push(...getOwnStaticObjectPairs(constructor2, propertyName));
      return pairs;
    }, []);
  }
  function getAncestorsForConstructor(constructor) {
    const ancestors = [];
    while (constructor) {
      ancestors.push(constructor);
      constructor = Object.getPrototypeOf(constructor);
    }
    return ancestors.reverse();
  }
  function getOwnStaticArrayValues(constructor, propertyName) {
    const definition = constructor[propertyName];
    return Array.isArray(definition) ? definition : [];
  }
  function getOwnStaticObjectPairs(constructor, propertyName) {
    const definition = constructor[propertyName];
    return definition ? Object.keys(definition).map((key) => [key, definition[key]]) : [];
  }
  var OutletObserver = class {
    constructor(context, delegate) {
      this.started = false;
      this.context = context;
      this.delegate = delegate;
      this.outletsByName = new Multimap();
      this.outletElementsByName = new Multimap();
      this.selectorObserverMap = /* @__PURE__ */ new Map();
      this.attributeObserverMap = /* @__PURE__ */ new Map();
    }
    start() {
      if (!this.started) {
        this.outletDefinitions.forEach((outletName) => {
          this.setupSelectorObserverForOutlet(outletName);
          this.setupAttributeObserverForOutlet(outletName);
        });
        this.started = true;
        this.dependentContexts.forEach((context) => context.refresh());
      }
    }
    refresh() {
      this.selectorObserverMap.forEach((observer) => observer.refresh());
      this.attributeObserverMap.forEach((observer) => observer.refresh());
    }
    stop() {
      if (this.started) {
        this.started = false;
        this.disconnectAllOutlets();
        this.stopSelectorObservers();
        this.stopAttributeObservers();
      }
    }
    stopSelectorObservers() {
      if (this.selectorObserverMap.size > 0) {
        this.selectorObserverMap.forEach((observer) => observer.stop());
        this.selectorObserverMap.clear();
      }
    }
    stopAttributeObservers() {
      if (this.attributeObserverMap.size > 0) {
        this.attributeObserverMap.forEach((observer) => observer.stop());
        this.attributeObserverMap.clear();
      }
    }
    selectorMatched(element, _selector, { outletName }) {
      const outlet = this.getOutlet(element, outletName);
      if (outlet) {
        this.connectOutlet(outlet, element, outletName);
      }
    }
    selectorUnmatched(element, _selector, { outletName }) {
      const outlet = this.getOutletFromMap(element, outletName);
      if (outlet) {
        this.disconnectOutlet(outlet, element, outletName);
      }
    }
    selectorMatchElement(element, { outletName }) {
      const selector = this.selector(outletName);
      const hasOutlet = this.hasOutlet(element, outletName);
      const hasOutletController = element.matches(`[${this.schema.controllerAttribute}~=${outletName}]`);
      if (selector) {
        return hasOutlet && hasOutletController && element.matches(selector);
      } else {
        return false;
      }
    }
    elementMatchedAttribute(_element, attributeName) {
      const outletName = this.getOutletNameFromOutletAttributeName(attributeName);
      if (outletName) {
        this.updateSelectorObserverForOutlet(outletName);
      }
    }
    elementAttributeValueChanged(_element, attributeName) {
      const outletName = this.getOutletNameFromOutletAttributeName(attributeName);
      if (outletName) {
        this.updateSelectorObserverForOutlet(outletName);
      }
    }
    elementUnmatchedAttribute(_element, attributeName) {
      const outletName = this.getOutletNameFromOutletAttributeName(attributeName);
      if (outletName) {
        this.updateSelectorObserverForOutlet(outletName);
      }
    }
    connectOutlet(outlet, element, outletName) {
      var _a;
      if (!this.outletElementsByName.has(outletName, element)) {
        this.outletsByName.add(outletName, outlet);
        this.outletElementsByName.add(outletName, element);
        (_a = this.selectorObserverMap.get(outletName)) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.outletConnected(outlet, element, outletName));
      }
    }
    disconnectOutlet(outlet, element, outletName) {
      var _a;
      if (this.outletElementsByName.has(outletName, element)) {
        this.outletsByName.delete(outletName, outlet);
        this.outletElementsByName.delete(outletName, element);
        (_a = this.selectorObserverMap.get(outletName)) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.outletDisconnected(outlet, element, outletName));
      }
    }
    disconnectAllOutlets() {
      for (const outletName of this.outletElementsByName.keys) {
        for (const element of this.outletElementsByName.getValuesForKey(outletName)) {
          for (const outlet of this.outletsByName.getValuesForKey(outletName)) {
            this.disconnectOutlet(outlet, element, outletName);
          }
        }
      }
    }
    updateSelectorObserverForOutlet(outletName) {
      const observer = this.selectorObserverMap.get(outletName);
      if (observer) {
        observer.selector = this.selector(outletName);
      }
    }
    setupSelectorObserverForOutlet(outletName) {
      const selector = this.selector(outletName);
      const selectorObserver = new SelectorObserver(document.body, selector, this, { outletName });
      this.selectorObserverMap.set(outletName, selectorObserver);
      selectorObserver.start();
    }
    setupAttributeObserverForOutlet(outletName) {
      const attributeName = this.attributeNameForOutletName(outletName);
      const attributeObserver = new AttributeObserver(this.scope.element, attributeName, this);
      this.attributeObserverMap.set(outletName, attributeObserver);
      attributeObserver.start();
    }
    selector(outletName) {
      return this.scope.outlets.getSelectorForOutletName(outletName);
    }
    attributeNameForOutletName(outletName) {
      return this.scope.schema.outletAttributeForScope(this.identifier, outletName);
    }
    getOutletNameFromOutletAttributeName(attributeName) {
      return this.outletDefinitions.find((outletName) => this.attributeNameForOutletName(outletName) === attributeName);
    }
    get outletDependencies() {
      const dependencies = new Multimap();
      this.router.modules.forEach((module) => {
        const constructor = module.definition.controllerConstructor;
        const outlets = readInheritableStaticArrayValues(constructor, "outlets");
        outlets.forEach((outlet) => dependencies.add(outlet, module.identifier));
      });
      return dependencies;
    }
    get outletDefinitions() {
      return this.outletDependencies.getKeysForValue(this.identifier);
    }
    get dependentControllerIdentifiers() {
      return this.outletDependencies.getValuesForKey(this.identifier);
    }
    get dependentContexts() {
      const identifiers = this.dependentControllerIdentifiers;
      return this.router.contexts.filter((context) => identifiers.includes(context.identifier));
    }
    hasOutlet(element, outletName) {
      return !!this.getOutlet(element, outletName) || !!this.getOutletFromMap(element, outletName);
    }
    getOutlet(element, outletName) {
      return this.application.getControllerForElementAndIdentifier(element, outletName);
    }
    getOutletFromMap(element, outletName) {
      return this.outletsByName.getValuesForKey(outletName).find((outlet) => outlet.element === element);
    }
    get scope() {
      return this.context.scope;
    }
    get schema() {
      return this.context.schema;
    }
    get identifier() {
      return this.context.identifier;
    }
    get application() {
      return this.context.application;
    }
    get router() {
      return this.application.router;
    }
  };
  var Context = class {
    constructor(module, scope) {
      this.logDebugActivity = (functionName, detail = {}) => {
        const { identifier, controller, element } = this;
        detail = Object.assign({ identifier, controller, element }, detail);
        this.application.logDebugActivity(this.identifier, functionName, detail);
      };
      this.module = module;
      this.scope = scope;
      this.controller = new module.controllerConstructor(this);
      this.bindingObserver = new BindingObserver(this, this.dispatcher);
      this.valueObserver = new ValueObserver(this, this.controller);
      this.targetObserver = new TargetObserver(this, this);
      this.outletObserver = new OutletObserver(this, this);
      try {
        this.controller.initialize();
        this.logDebugActivity("initialize");
      } catch (error2) {
        this.handleError(error2, "initializing controller");
      }
    }
    connect() {
      this.bindingObserver.start();
      this.valueObserver.start();
      this.targetObserver.start();
      this.outletObserver.start();
      try {
        this.controller.connect();
        this.logDebugActivity("connect");
      } catch (error2) {
        this.handleError(error2, "connecting controller");
      }
    }
    refresh() {
      this.outletObserver.refresh();
    }
    disconnect() {
      try {
        this.controller.disconnect();
        this.logDebugActivity("disconnect");
      } catch (error2) {
        this.handleError(error2, "disconnecting controller");
      }
      this.outletObserver.stop();
      this.targetObserver.stop();
      this.valueObserver.stop();
      this.bindingObserver.stop();
    }
    get application() {
      return this.module.application;
    }
    get identifier() {
      return this.module.identifier;
    }
    get schema() {
      return this.application.schema;
    }
    get dispatcher() {
      return this.application.dispatcher;
    }
    get element() {
      return this.scope.element;
    }
    get parentElement() {
      return this.element.parentElement;
    }
    handleError(error2, message, detail = {}) {
      const { identifier, controller, element } = this;
      detail = Object.assign({ identifier, controller, element }, detail);
      this.application.handleError(error2, `Error ${message}`, detail);
    }
    targetConnected(element, name) {
      this.invokeControllerMethod(`${name}TargetConnected`, element);
    }
    targetDisconnected(element, name) {
      this.invokeControllerMethod(`${name}TargetDisconnected`, element);
    }
    outletConnected(outlet, element, name) {
      this.invokeControllerMethod(`${namespaceCamelize(name)}OutletConnected`, outlet, element);
    }
    outletDisconnected(outlet, element, name) {
      this.invokeControllerMethod(`${namespaceCamelize(name)}OutletDisconnected`, outlet, element);
    }
    invokeControllerMethod(methodName, ...args) {
      const controller = this.controller;
      if (typeof controller[methodName] == "function") {
        controller[methodName](...args);
      }
    }
  };
  function bless(constructor) {
    return shadow(constructor, getBlessedProperties(constructor));
  }
  function shadow(constructor, properties) {
    const shadowConstructor = extend2(constructor);
    const shadowProperties = getShadowProperties(constructor.prototype, properties);
    Object.defineProperties(shadowConstructor.prototype, shadowProperties);
    return shadowConstructor;
  }
  function getBlessedProperties(constructor) {
    const blessings = readInheritableStaticArrayValues(constructor, "blessings");
    return blessings.reduce((blessedProperties, blessing) => {
      const properties = blessing(constructor);
      for (const key in properties) {
        const descriptor = blessedProperties[key] || {};
        blessedProperties[key] = Object.assign(descriptor, properties[key]);
      }
      return blessedProperties;
    }, {});
  }
  function getShadowProperties(prototype, properties) {
    return getOwnKeys(properties).reduce((shadowProperties, key) => {
      const descriptor = getShadowedDescriptor(prototype, properties, key);
      if (descriptor) {
        Object.assign(shadowProperties, { [key]: descriptor });
      }
      return shadowProperties;
    }, {});
  }
  function getShadowedDescriptor(prototype, properties, key) {
    const shadowingDescriptor = Object.getOwnPropertyDescriptor(prototype, key);
    const shadowedByValue = shadowingDescriptor && "value" in shadowingDescriptor;
    if (!shadowedByValue) {
      const descriptor = Object.getOwnPropertyDescriptor(properties, key).value;
      if (shadowingDescriptor) {
        descriptor.get = shadowingDescriptor.get || descriptor.get;
        descriptor.set = shadowingDescriptor.set || descriptor.set;
      }
      return descriptor;
    }
  }
  var getOwnKeys = (() => {
    if (typeof Object.getOwnPropertySymbols == "function") {
      return (object) => [...Object.getOwnPropertyNames(object), ...Object.getOwnPropertySymbols(object)];
    } else {
      return Object.getOwnPropertyNames;
    }
  })();
  var extend2 = (() => {
    function extendWithReflect(constructor) {
      function extended() {
        return Reflect.construct(constructor, arguments, new.target);
      }
      extended.prototype = Object.create(constructor.prototype, {
        constructor: { value: extended }
      });
      Reflect.setPrototypeOf(extended, constructor);
      return extended;
    }
    function testReflectExtension() {
      const a2 = function() {
        this.a.call(this);
      };
      const b2 = extendWithReflect(a2);
      b2.prototype.a = function() {
      };
      return new b2();
    }
    try {
      testReflectExtension();
      return extendWithReflect;
    } catch (error2) {
      return (constructor) => class extended extends constructor {
      };
    }
  })();
  function blessDefinition(definition) {
    return {
      identifier: definition.identifier,
      controllerConstructor: bless(definition.controllerConstructor)
    };
  }
  var Module = class {
    constructor(application2, definition) {
      this.application = application2;
      this.definition = blessDefinition(definition);
      this.contextsByScope = /* @__PURE__ */ new WeakMap();
      this.connectedContexts = /* @__PURE__ */ new Set();
    }
    get identifier() {
      return this.definition.identifier;
    }
    get controllerConstructor() {
      return this.definition.controllerConstructor;
    }
    get contexts() {
      return Array.from(this.connectedContexts);
    }
    connectContextForScope(scope) {
      const context = this.fetchContextForScope(scope);
      this.connectedContexts.add(context);
      context.connect();
    }
    disconnectContextForScope(scope) {
      const context = this.contextsByScope.get(scope);
      if (context) {
        this.connectedContexts.delete(context);
        context.disconnect();
      }
    }
    fetchContextForScope(scope) {
      let context = this.contextsByScope.get(scope);
      if (!context) {
        context = new Context(this, scope);
        this.contextsByScope.set(scope, context);
      }
      return context;
    }
  };
  var ClassMap = class {
    constructor(scope) {
      this.scope = scope;
    }
    has(name) {
      return this.data.has(this.getDataKey(name));
    }
    get(name) {
      return this.getAll(name)[0];
    }
    getAll(name) {
      const tokenString = this.data.get(this.getDataKey(name)) || "";
      return tokenize(tokenString);
    }
    getAttributeName(name) {
      return this.data.getAttributeNameForKey(this.getDataKey(name));
    }
    getDataKey(name) {
      return `${name}-class`;
    }
    get data() {
      return this.scope.data;
    }
  };
  var DataMap = class {
    constructor(scope) {
      this.scope = scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get(key) {
      const name = this.getAttributeNameForKey(key);
      return this.element.getAttribute(name);
    }
    set(key, value) {
      const name = this.getAttributeNameForKey(key);
      this.element.setAttribute(name, value);
      return this.get(key);
    }
    has(key) {
      const name = this.getAttributeNameForKey(key);
      return this.element.hasAttribute(name);
    }
    delete(key) {
      if (this.has(key)) {
        const name = this.getAttributeNameForKey(key);
        this.element.removeAttribute(name);
        return true;
      } else {
        return false;
      }
    }
    getAttributeNameForKey(key) {
      return `data-${this.identifier}-${dasherize(key)}`;
    }
  };
  var Guide = class {
    constructor(logger) {
      this.warnedKeysByObject = /* @__PURE__ */ new WeakMap();
      this.logger = logger;
    }
    warn(object, key, message) {
      let warnedKeys = this.warnedKeysByObject.get(object);
      if (!warnedKeys) {
        warnedKeys = /* @__PURE__ */ new Set();
        this.warnedKeysByObject.set(object, warnedKeys);
      }
      if (!warnedKeys.has(key)) {
        warnedKeys.add(key);
        this.logger.warn(message, object);
      }
    }
  };
  function attributeValueContainsToken(attributeName, token) {
    return `[${attributeName}~="${token}"]`;
  }
  var TargetSet = class {
    constructor(scope) {
      this.scope = scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get schema() {
      return this.scope.schema;
    }
    has(targetName) {
      return this.find(targetName) != null;
    }
    find(...targetNames) {
      return targetNames.reduce((target, targetName) => target || this.findTarget(targetName) || this.findLegacyTarget(targetName), void 0);
    }
    findAll(...targetNames) {
      return targetNames.reduce((targets, targetName) => [
        ...targets,
        ...this.findAllTargets(targetName),
        ...this.findAllLegacyTargets(targetName)
      ], []);
    }
    findTarget(targetName) {
      const selector = this.getSelectorForTargetName(targetName);
      return this.scope.findElement(selector);
    }
    findAllTargets(targetName) {
      const selector = this.getSelectorForTargetName(targetName);
      return this.scope.findAllElements(selector);
    }
    getSelectorForTargetName(targetName) {
      const attributeName = this.schema.targetAttributeForScope(this.identifier);
      return attributeValueContainsToken(attributeName, targetName);
    }
    findLegacyTarget(targetName) {
      const selector = this.getLegacySelectorForTargetName(targetName);
      return this.deprecate(this.scope.findElement(selector), targetName);
    }
    findAllLegacyTargets(targetName) {
      const selector = this.getLegacySelectorForTargetName(targetName);
      return this.scope.findAllElements(selector).map((element) => this.deprecate(element, targetName));
    }
    getLegacySelectorForTargetName(targetName) {
      const targetDescriptor = `${this.identifier}.${targetName}`;
      return attributeValueContainsToken(this.schema.targetAttribute, targetDescriptor);
    }
    deprecate(element, targetName) {
      if (element) {
        const { identifier } = this;
        const attributeName = this.schema.targetAttribute;
        const revisedAttributeName = this.schema.targetAttributeForScope(identifier);
        this.guide.warn(element, `target:${targetName}`, `Please replace ${attributeName}="${identifier}.${targetName}" with ${revisedAttributeName}="${targetName}". The ${attributeName} attribute is deprecated and will be removed in a future version of Stimulus.`);
      }
      return element;
    }
    get guide() {
      return this.scope.guide;
    }
  };
  var OutletSet = class {
    constructor(scope, controllerElement) {
      this.scope = scope;
      this.controllerElement = controllerElement;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get schema() {
      return this.scope.schema;
    }
    has(outletName) {
      return this.find(outletName) != null;
    }
    find(...outletNames) {
      return outletNames.reduce((outlet, outletName) => outlet || this.findOutlet(outletName), void 0);
    }
    findAll(...outletNames) {
      return outletNames.reduce((outlets, outletName) => [...outlets, ...this.findAllOutlets(outletName)], []);
    }
    getSelectorForOutletName(outletName) {
      const attributeName = this.schema.outletAttributeForScope(this.identifier, outletName);
      return this.controllerElement.getAttribute(attributeName);
    }
    findOutlet(outletName) {
      const selector = this.getSelectorForOutletName(outletName);
      if (selector)
        return this.findElement(selector, outletName);
    }
    findAllOutlets(outletName) {
      const selector = this.getSelectorForOutletName(outletName);
      return selector ? this.findAllElements(selector, outletName) : [];
    }
    findElement(selector, outletName) {
      const elements = this.scope.queryElements(selector);
      return elements.filter((element) => this.matchesElement(element, selector, outletName))[0];
    }
    findAllElements(selector, outletName) {
      const elements = this.scope.queryElements(selector);
      return elements.filter((element) => this.matchesElement(element, selector, outletName));
    }
    matchesElement(element, selector, outletName) {
      const controllerAttribute = element.getAttribute(this.scope.schema.controllerAttribute) || "";
      return element.matches(selector) && controllerAttribute.split(" ").includes(outletName);
    }
  };
  var Scope = class _Scope {
    constructor(schema, element, identifier, logger) {
      this.targets = new TargetSet(this);
      this.classes = new ClassMap(this);
      this.data = new DataMap(this);
      this.containsElement = (element2) => {
        return element2.closest(this.controllerSelector) === this.element;
      };
      this.schema = schema;
      this.element = element;
      this.identifier = identifier;
      this.guide = new Guide(logger);
      this.outlets = new OutletSet(this.documentScope, element);
    }
    findElement(selector) {
      return this.element.matches(selector) ? this.element : this.queryElements(selector).find(this.containsElement);
    }
    findAllElements(selector) {
      return [
        ...this.element.matches(selector) ? [this.element] : [],
        ...this.queryElements(selector).filter(this.containsElement)
      ];
    }
    queryElements(selector) {
      return Array.from(this.element.querySelectorAll(selector));
    }
    get controllerSelector() {
      return attributeValueContainsToken(this.schema.controllerAttribute, this.identifier);
    }
    get isDocumentScope() {
      return this.element === document.documentElement;
    }
    get documentScope() {
      return this.isDocumentScope ? this : new _Scope(this.schema, document.documentElement, this.identifier, this.guide.logger);
    }
  };
  var ScopeObserver = class {
    constructor(element, schema, delegate) {
      this.element = element;
      this.schema = schema;
      this.delegate = delegate;
      this.valueListObserver = new ValueListObserver(this.element, this.controllerAttribute, this);
      this.scopesByIdentifierByElement = /* @__PURE__ */ new WeakMap();
      this.scopeReferenceCounts = /* @__PURE__ */ new WeakMap();
    }
    start() {
      this.valueListObserver.start();
    }
    stop() {
      this.valueListObserver.stop();
    }
    get controllerAttribute() {
      return this.schema.controllerAttribute;
    }
    parseValueForToken(token) {
      const { element, content: identifier } = token;
      return this.parseValueForElementAndIdentifier(element, identifier);
    }
    parseValueForElementAndIdentifier(element, identifier) {
      const scopesByIdentifier = this.fetchScopesByIdentifierForElement(element);
      let scope = scopesByIdentifier.get(identifier);
      if (!scope) {
        scope = this.delegate.createScopeForElementAndIdentifier(element, identifier);
        scopesByIdentifier.set(identifier, scope);
      }
      return scope;
    }
    elementMatchedValue(element, value) {
      const referenceCount = (this.scopeReferenceCounts.get(value) || 0) + 1;
      this.scopeReferenceCounts.set(value, referenceCount);
      if (referenceCount == 1) {
        this.delegate.scopeConnected(value);
      }
    }
    elementUnmatchedValue(element, value) {
      const referenceCount = this.scopeReferenceCounts.get(value);
      if (referenceCount) {
        this.scopeReferenceCounts.set(value, referenceCount - 1);
        if (referenceCount == 1) {
          this.delegate.scopeDisconnected(value);
        }
      }
    }
    fetchScopesByIdentifierForElement(element) {
      let scopesByIdentifier = this.scopesByIdentifierByElement.get(element);
      if (!scopesByIdentifier) {
        scopesByIdentifier = /* @__PURE__ */ new Map();
        this.scopesByIdentifierByElement.set(element, scopesByIdentifier);
      }
      return scopesByIdentifier;
    }
  };
  var Router = class {
    constructor(application2) {
      this.application = application2;
      this.scopeObserver = new ScopeObserver(this.element, this.schema, this);
      this.scopesByIdentifier = new Multimap();
      this.modulesByIdentifier = /* @__PURE__ */ new Map();
    }
    get element() {
      return this.application.element;
    }
    get schema() {
      return this.application.schema;
    }
    get logger() {
      return this.application.logger;
    }
    get controllerAttribute() {
      return this.schema.controllerAttribute;
    }
    get modules() {
      return Array.from(this.modulesByIdentifier.values());
    }
    get contexts() {
      return this.modules.reduce((contexts, module) => contexts.concat(module.contexts), []);
    }
    start() {
      this.scopeObserver.start();
    }
    stop() {
      this.scopeObserver.stop();
    }
    loadDefinition(definition) {
      this.unloadIdentifier(definition.identifier);
      const module = new Module(this.application, definition);
      this.connectModule(module);
      const afterLoad = definition.controllerConstructor.afterLoad;
      if (afterLoad) {
        afterLoad.call(definition.controllerConstructor, definition.identifier, this.application);
      }
    }
    unloadIdentifier(identifier) {
      const module = this.modulesByIdentifier.get(identifier);
      if (module) {
        this.disconnectModule(module);
      }
    }
    getContextForElementAndIdentifier(element, identifier) {
      const module = this.modulesByIdentifier.get(identifier);
      if (module) {
        return module.contexts.find((context) => context.element == element);
      }
    }
    proposeToConnectScopeForElementAndIdentifier(element, identifier) {
      const scope = this.scopeObserver.parseValueForElementAndIdentifier(element, identifier);
      if (scope) {
        this.scopeObserver.elementMatchedValue(scope.element, scope);
      } else {
        console.error(`Couldn't find or create scope for identifier: "${identifier}" and element:`, element);
      }
    }
    handleError(error2, message, detail) {
      this.application.handleError(error2, message, detail);
    }
    createScopeForElementAndIdentifier(element, identifier) {
      return new Scope(this.schema, element, identifier, this.logger);
    }
    scopeConnected(scope) {
      this.scopesByIdentifier.add(scope.identifier, scope);
      const module = this.modulesByIdentifier.get(scope.identifier);
      if (module) {
        module.connectContextForScope(scope);
      }
    }
    scopeDisconnected(scope) {
      this.scopesByIdentifier.delete(scope.identifier, scope);
      const module = this.modulesByIdentifier.get(scope.identifier);
      if (module) {
        module.disconnectContextForScope(scope);
      }
    }
    connectModule(module) {
      this.modulesByIdentifier.set(module.identifier, module);
      const scopes = this.scopesByIdentifier.getValuesForKey(module.identifier);
      scopes.forEach((scope) => module.connectContextForScope(scope));
    }
    disconnectModule(module) {
      this.modulesByIdentifier.delete(module.identifier);
      const scopes = this.scopesByIdentifier.getValuesForKey(module.identifier);
      scopes.forEach((scope) => module.disconnectContextForScope(scope));
    }
  };
  var defaultSchema = {
    controllerAttribute: "data-controller",
    actionAttribute: "data-action",
    targetAttribute: "data-target",
    targetAttributeForScope: (identifier) => `data-${identifier}-target`,
    outletAttributeForScope: (identifier, outlet) => `data-${identifier}-${outlet}-outlet`,
    keyMappings: Object.assign(Object.assign({ enter: "Enter", tab: "Tab", esc: "Escape", space: " ", up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", home: "Home", end: "End", page_up: "PageUp", page_down: "PageDown" }, objectFromEntries("abcdefghijklmnopqrstuvwxyz".split("").map((c2) => [c2, c2]))), objectFromEntries("0123456789".split("").map((n2) => [n2, n2])))
  };
  function objectFromEntries(array) {
    return array.reduce((memo, [k2, v2]) => Object.assign(Object.assign({}, memo), { [k2]: v2 }), {});
  }
  var Application = class {
    constructor(element = document.documentElement, schema = defaultSchema) {
      this.logger = console;
      this.debug = false;
      this.logDebugActivity = (identifier, functionName, detail = {}) => {
        if (this.debug) {
          this.logFormattedMessage(identifier, functionName, detail);
        }
      };
      this.element = element;
      this.schema = schema;
      this.dispatcher = new Dispatcher(this);
      this.router = new Router(this);
      this.actionDescriptorFilters = Object.assign({}, defaultActionDescriptorFilters);
    }
    static start(element, schema) {
      const application2 = new this(element, schema);
      application2.start();
      return application2;
    }
    async start() {
      await domReady();
      this.logDebugActivity("application", "starting");
      this.dispatcher.start();
      this.router.start();
      this.logDebugActivity("application", "start");
    }
    stop() {
      this.logDebugActivity("application", "stopping");
      this.dispatcher.stop();
      this.router.stop();
      this.logDebugActivity("application", "stop");
    }
    register(identifier, controllerConstructor) {
      this.load({ identifier, controllerConstructor });
    }
    registerActionOption(name, filter) {
      this.actionDescriptorFilters[name] = filter;
    }
    load(head, ...rest) {
      const definitions = Array.isArray(head) ? head : [head, ...rest];
      definitions.forEach((definition) => {
        if (definition.controllerConstructor.shouldLoad) {
          this.router.loadDefinition(definition);
        }
      });
    }
    unload(head, ...rest) {
      const identifiers = Array.isArray(head) ? head : [head, ...rest];
      identifiers.forEach((identifier) => this.router.unloadIdentifier(identifier));
    }
    get controllers() {
      return this.router.contexts.map((context) => context.controller);
    }
    getControllerForElementAndIdentifier(element, identifier) {
      const context = this.router.getContextForElementAndIdentifier(element, identifier);
      return context ? context.controller : null;
    }
    handleError(error2, message, detail) {
      var _a;
      this.logger.error(`%s

%o

%o`, message, error2, detail);
      (_a = window.onerror) === null || _a === void 0 ? void 0 : _a.call(window, message, "", 0, 0, error2);
    }
    logFormattedMessage(identifier, functionName, detail = {}) {
      detail = Object.assign({ application: this }, detail);
      this.logger.groupCollapsed(`${identifier} #${functionName}`);
      this.logger.log("details:", Object.assign({}, detail));
      this.logger.groupEnd();
    }
  };
  function domReady() {
    return new Promise((resolve) => {
      if (document.readyState == "loading") {
        document.addEventListener("DOMContentLoaded", () => resolve());
      } else {
        resolve();
      }
    });
  }
  function ClassPropertiesBlessing(constructor) {
    const classes = readInheritableStaticArrayValues(constructor, "classes");
    return classes.reduce((properties, classDefinition) => {
      return Object.assign(properties, propertiesForClassDefinition(classDefinition));
    }, {});
  }
  function propertiesForClassDefinition(key) {
    return {
      [`${key}Class`]: {
        get() {
          const { classes } = this;
          if (classes.has(key)) {
            return classes.get(key);
          } else {
            const attribute = classes.getAttributeName(key);
            throw new Error(`Missing attribute "${attribute}"`);
          }
        }
      },
      [`${key}Classes`]: {
        get() {
          return this.classes.getAll(key);
        }
      },
      [`has${capitalize(key)}Class`]: {
        get() {
          return this.classes.has(key);
        }
      }
    };
  }
  function OutletPropertiesBlessing(constructor) {
    const outlets = readInheritableStaticArrayValues(constructor, "outlets");
    return outlets.reduce((properties, outletDefinition) => {
      return Object.assign(properties, propertiesForOutletDefinition(outletDefinition));
    }, {});
  }
  function getOutletController(controller, element, identifier) {
    return controller.application.getControllerForElementAndIdentifier(element, identifier);
  }
  function getControllerAndEnsureConnectedScope(controller, element, outletName) {
    let outletController = getOutletController(controller, element, outletName);
    if (outletController)
      return outletController;
    controller.application.router.proposeToConnectScopeForElementAndIdentifier(element, outletName);
    outletController = getOutletController(controller, element, outletName);
    if (outletController)
      return outletController;
  }
  function propertiesForOutletDefinition(name) {
    const camelizedName = namespaceCamelize(name);
    return {
      [`${camelizedName}Outlet`]: {
        get() {
          const outletElement = this.outlets.find(name);
          const selector = this.outlets.getSelectorForOutletName(name);
          if (outletElement) {
            const outletController = getControllerAndEnsureConnectedScope(this, outletElement, name);
            if (outletController)
              return outletController;
            throw new Error(`The provided outlet element is missing an outlet controller "${name}" instance for host controller "${this.identifier}"`);
          }
          throw new Error(`Missing outlet element "${name}" for host controller "${this.identifier}". Stimulus couldn't find a matching outlet element using selector "${selector}".`);
        }
      },
      [`${camelizedName}Outlets`]: {
        get() {
          const outlets = this.outlets.findAll(name);
          if (outlets.length > 0) {
            return outlets.map((outletElement) => {
              const outletController = getControllerAndEnsureConnectedScope(this, outletElement, name);
              if (outletController)
                return outletController;
              console.warn(`The provided outlet element is missing an outlet controller "${name}" instance for host controller "${this.identifier}"`, outletElement);
            }).filter((controller) => controller);
          }
          return [];
        }
      },
      [`${camelizedName}OutletElement`]: {
        get() {
          const outletElement = this.outlets.find(name);
          const selector = this.outlets.getSelectorForOutletName(name);
          if (outletElement) {
            return outletElement;
          } else {
            throw new Error(`Missing outlet element "${name}" for host controller "${this.identifier}". Stimulus couldn't find a matching outlet element using selector "${selector}".`);
          }
        }
      },
      [`${camelizedName}OutletElements`]: {
        get() {
          return this.outlets.findAll(name);
        }
      },
      [`has${capitalize(camelizedName)}Outlet`]: {
        get() {
          return this.outlets.has(name);
        }
      }
    };
  }
  function TargetPropertiesBlessing(constructor) {
    const targets = readInheritableStaticArrayValues(constructor, "targets");
    return targets.reduce((properties, targetDefinition) => {
      return Object.assign(properties, propertiesForTargetDefinition(targetDefinition));
    }, {});
  }
  function propertiesForTargetDefinition(name) {
    return {
      [`${name}Target`]: {
        get() {
          const target = this.targets.find(name);
          if (target) {
            return target;
          } else {
            throw new Error(`Missing target element "${name}" for "${this.identifier}" controller`);
          }
        }
      },
      [`${name}Targets`]: {
        get() {
          return this.targets.findAll(name);
        }
      },
      [`has${capitalize(name)}Target`]: {
        get() {
          return this.targets.has(name);
        }
      }
    };
  }
  function ValuePropertiesBlessing(constructor) {
    const valueDefinitionPairs = readInheritableStaticObjectPairs(constructor, "values");
    const propertyDescriptorMap = {
      valueDescriptorMap: {
        get() {
          return valueDefinitionPairs.reduce((result, valueDefinitionPair) => {
            const valueDescriptor = parseValueDefinitionPair(valueDefinitionPair, this.identifier);
            const attributeName = this.data.getAttributeNameForKey(valueDescriptor.key);
            return Object.assign(result, { [attributeName]: valueDescriptor });
          }, {});
        }
      }
    };
    return valueDefinitionPairs.reduce((properties, valueDefinitionPair) => {
      return Object.assign(properties, propertiesForValueDefinitionPair(valueDefinitionPair));
    }, propertyDescriptorMap);
  }
  function propertiesForValueDefinitionPair(valueDefinitionPair, controller) {
    const definition = parseValueDefinitionPair(valueDefinitionPair, controller);
    const { key, name, reader: read, writer: write } = definition;
    return {
      [name]: {
        get() {
          const value = this.data.get(key);
          if (value !== null) {
            return read(value);
          } else {
            return definition.defaultValue;
          }
        },
        set(value) {
          if (value === void 0) {
            this.data.delete(key);
          } else {
            this.data.set(key, write(value));
          }
        }
      },
      [`has${capitalize(name)}`]: {
        get() {
          return this.data.has(key) || definition.hasCustomDefaultValue;
        }
      }
    };
  }
  function parseValueDefinitionPair([token, typeDefinition], controller) {
    return valueDescriptorForTokenAndTypeDefinition({
      controller,
      token,
      typeDefinition
    });
  }
  function parseValueTypeConstant(constant) {
    switch (constant) {
      case Array:
        return "array";
      case Boolean:
        return "boolean";
      case Number:
        return "number";
      case Object:
        return "object";
      case String:
        return "string";
    }
  }
  function parseValueTypeDefault(defaultValue) {
    switch (typeof defaultValue) {
      case "boolean":
        return "boolean";
      case "number":
        return "number";
      case "string":
        return "string";
    }
    if (Array.isArray(defaultValue))
      return "array";
    if (Object.prototype.toString.call(defaultValue) === "[object Object]")
      return "object";
  }
  function parseValueTypeObject(payload) {
    const { controller, token, typeObject } = payload;
    const hasType = isSomething(typeObject.type);
    const hasDefault = isSomething(typeObject.default);
    const fullObject = hasType && hasDefault;
    const onlyType = hasType && !hasDefault;
    const onlyDefault = !hasType && hasDefault;
    const typeFromObject = parseValueTypeConstant(typeObject.type);
    const typeFromDefaultValue = parseValueTypeDefault(payload.typeObject.default);
    if (onlyType)
      return typeFromObject;
    if (onlyDefault)
      return typeFromDefaultValue;
    if (typeFromObject !== typeFromDefaultValue) {
      const propertyPath = controller ? `${controller}.${token}` : token;
      throw new Error(`The specified default value for the Stimulus Value "${propertyPath}" must match the defined type "${typeFromObject}". The provided default value of "${typeObject.default}" is of type "${typeFromDefaultValue}".`);
    }
    if (fullObject)
      return typeFromObject;
  }
  function parseValueTypeDefinition(payload) {
    const { controller, token, typeDefinition } = payload;
    const typeObject = { controller, token, typeObject: typeDefinition };
    const typeFromObject = parseValueTypeObject(typeObject);
    const typeFromDefaultValue = parseValueTypeDefault(typeDefinition);
    const typeFromConstant = parseValueTypeConstant(typeDefinition);
    const type = typeFromObject || typeFromDefaultValue || typeFromConstant;
    if (type)
      return type;
    const propertyPath = controller ? `${controller}.${typeDefinition}` : token;
    throw new Error(`Unknown value type "${propertyPath}" for "${token}" value`);
  }
  function defaultValueForDefinition(typeDefinition) {
    const constant = parseValueTypeConstant(typeDefinition);
    if (constant)
      return defaultValuesByType[constant];
    const hasDefault = hasProperty(typeDefinition, "default");
    const hasType = hasProperty(typeDefinition, "type");
    const typeObject = typeDefinition;
    if (hasDefault)
      return typeObject.default;
    if (hasType) {
      const { type } = typeObject;
      const constantFromType = parseValueTypeConstant(type);
      if (constantFromType)
        return defaultValuesByType[constantFromType];
    }
    return typeDefinition;
  }
  function valueDescriptorForTokenAndTypeDefinition(payload) {
    const { token, typeDefinition } = payload;
    const key = `${dasherize(token)}-value`;
    const type = parseValueTypeDefinition(payload);
    return {
      type,
      key,
      name: camelize(key),
      get defaultValue() {
        return defaultValueForDefinition(typeDefinition);
      },
      get hasCustomDefaultValue() {
        return parseValueTypeDefault(typeDefinition) !== void 0;
      },
      reader: readers[type],
      writer: writers[type] || writers.default
    };
  }
  var defaultValuesByType = {
    get array() {
      return [];
    },
    boolean: false,
    number: 0,
    get object() {
      return {};
    },
    string: ""
  };
  var readers = {
    array(value) {
      const array = JSON.parse(value);
      if (!Array.isArray(array)) {
        throw new TypeError(`expected value of type "array" but instead got value "${value}" of type "${parseValueTypeDefault(array)}"`);
      }
      return array;
    },
    boolean(value) {
      return !(value == "0" || String(value).toLowerCase() == "false");
    },
    number(value) {
      return Number(value.replace(/_/g, ""));
    },
    object(value) {
      const object = JSON.parse(value);
      if (object === null || typeof object != "object" || Array.isArray(object)) {
        throw new TypeError(`expected value of type "object" but instead got value "${value}" of type "${parseValueTypeDefault(object)}"`);
      }
      return object;
    },
    string(value) {
      return value;
    }
  };
  var writers = {
    default: writeString,
    array: writeJSON,
    object: writeJSON
  };
  function writeJSON(value) {
    return JSON.stringify(value);
  }
  function writeString(value) {
    return `${value}`;
  }
  var Controller = class {
    constructor(context) {
      this.context = context;
    }
    static get shouldLoad() {
      return true;
    }
    static afterLoad(_identifier, _application) {
      return;
    }
    get application() {
      return this.context.application;
    }
    get scope() {
      return this.context.scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get targets() {
      return this.scope.targets;
    }
    get outlets() {
      return this.scope.outlets;
    }
    get classes() {
      return this.scope.classes;
    }
    get data() {
      return this.scope.data;
    }
    initialize() {
    }
    connect() {
    }
    disconnect() {
    }
    dispatch(eventName, { target = this.element, detail = {}, prefix = this.identifier, bubbles = true, cancelable = true } = {}) {
      const type = prefix ? `${prefix}:${eventName}` : eventName;
      const event = new CustomEvent(type, { detail, bubbles, cancelable });
      target.dispatchEvent(event);
      return event;
    }
  };
  Controller.blessings = [
    ClassPropertiesBlessing,
    TargetPropertiesBlessing,
    ValuePropertiesBlessing,
    OutletPropertiesBlessing
  ];
  Controller.targets = [];
  Controller.outlets = [];
  Controller.values = {};

  // app/javascript/controllers/application.js
  var application = Application.start();
  application.debug = false;
  window.Stimulus = application;

  // app/javascript/controllers/confirm_controller.js
  var confirm_controller_default = class extends Controller {
    call(e2) {
      let message = this.element.getAttribute("data-confirm");
      if (!confirm(message)) {
        e2.preventDefault();
      }
    }
  };

  // app/javascript/controllers/btn_preloader_controller.js
  var btn_preloader_controller_default = class extends Controller {
    call(e2) {
      this.element.insertAdjacentHTML("afterbegin", '<div id="loader" class="loader"></div>');
      setTimeout(() => {
        this.element.querySelector("#loader").remove();
      }, 1e3);
    }
  };

  // app/javascript/controllers/index.js
  application.register("confirm", confirm_controller_default);
  application.register("btn_preloader", btn_preloader_controller_default);

  // app/javascript/application.js
  var import_bootstrap = __toESM(require_bootstrap());

  // node_modules/@fancyapps/ui/dist/index.esm.js
  var t = (t2, e2 = 1e4) => (t2 = parseFloat(t2 + "") || 0, Math.round((t2 + Number.EPSILON) * e2) / e2);
  var e = function(t2) {
    if (!(t2 && t2 instanceof Element && t2.offsetParent))
      return false;
    const e2 = t2.scrollHeight > t2.clientHeight, i2 = window.getComputedStyle(t2).overflowY, n2 = -1 !== i2.indexOf("hidden"), s2 = -1 !== i2.indexOf("visible");
    return e2 && !n2 && !s2;
  };
  var i = function(t2, n2 = void 0) {
    return !(!t2 || t2 === document.body || n2 && t2 === n2) && (e(t2) ? t2 : i(t2.parentElement, n2));
  };
  var n = function(t2) {
    var e2 = new DOMParser().parseFromString(t2, "text/html").body;
    if (e2.childElementCount > 1) {
      for (var i2 = document.createElement("div"); e2.firstChild; )
        i2.appendChild(e2.firstChild);
      return i2;
    }
    return e2.firstChild;
  };
  var s = (t2) => `${t2 || ""}`.split(" ").filter((t3) => !!t3);
  var o = (t2, e2, i2) => {
    t2 && s(e2).forEach((e3) => {
      t2.classList.toggle(e3, i2 || false);
    });
  };
  var a = class {
    constructor(t2) {
      Object.defineProperty(this, "pageX", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "pageY", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "clientX", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "clientY", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "id", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "time", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "nativePointer", { enumerable: true, configurable: true, writable: true, value: void 0 }), this.nativePointer = t2, this.pageX = t2.pageX, this.pageY = t2.pageY, this.clientX = t2.clientX, this.clientY = t2.clientY, this.id = self.Touch && t2 instanceof Touch ? t2.identifier : -1, this.time = Date.now();
    }
  };
  var r = { passive: false };
  var l = class {
    constructor(t2, { start: e2 = () => true, move: i2 = () => {
    }, end: n2 = () => {
    } }) {
      Object.defineProperty(this, "element", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "startCallback", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "moveCallback", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "endCallback", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "currentPointers", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "startPointers", { enumerable: true, configurable: true, writable: true, value: [] }), this.element = t2, this.startCallback = e2, this.moveCallback = i2, this.endCallback = n2;
      for (const t3 of ["onPointerStart", "onTouchStart", "onMove", "onTouchEnd", "onPointerEnd", "onWindowBlur"])
        this[t3] = this[t3].bind(this);
      this.element.addEventListener("mousedown", this.onPointerStart, r), this.element.addEventListener("touchstart", this.onTouchStart, r), this.element.addEventListener("touchmove", this.onMove, r), this.element.addEventListener("touchend", this.onTouchEnd), this.element.addEventListener("touchcancel", this.onTouchEnd);
    }
    onPointerStart(t2) {
      if (!t2.buttons || 0 !== t2.button)
        return;
      const e2 = new a(t2);
      this.currentPointers.some((t3) => t3.id === e2.id) || this.triggerPointerStart(e2, t2) && (window.addEventListener("mousemove", this.onMove), window.addEventListener("mouseup", this.onPointerEnd), window.addEventListener("blur", this.onWindowBlur));
    }
    onTouchStart(t2) {
      for (const e2 of Array.from(t2.changedTouches || []))
        this.triggerPointerStart(new a(e2), t2);
      window.addEventListener("blur", this.onWindowBlur);
    }
    onMove(t2) {
      const e2 = this.currentPointers.slice(), i2 = "changedTouches" in t2 ? Array.from(t2.changedTouches || []).map((t3) => new a(t3)) : [new a(t2)], n2 = [];
      for (const t3 of i2) {
        const e3 = this.currentPointers.findIndex((e4) => e4.id === t3.id);
        e3 < 0 || (n2.push(t3), this.currentPointers[e3] = t3);
      }
      n2.length && this.moveCallback(t2, this.currentPointers.slice(), e2);
    }
    onPointerEnd(t2) {
      t2.buttons > 0 && 0 !== t2.button || (this.triggerPointerEnd(t2, new a(t2)), window.removeEventListener("mousemove", this.onMove), window.removeEventListener("mouseup", this.onPointerEnd), window.removeEventListener("blur", this.onWindowBlur));
    }
    onTouchEnd(t2) {
      for (const e2 of Array.from(t2.changedTouches || []))
        this.triggerPointerEnd(t2, new a(e2));
    }
    triggerPointerStart(t2, e2) {
      return !!this.startCallback(e2, t2, this.currentPointers.slice()) && (this.currentPointers.push(t2), this.startPointers.push(t2), true);
    }
    triggerPointerEnd(t2, e2) {
      const i2 = this.currentPointers.findIndex((t3) => t3.id === e2.id);
      i2 < 0 || (this.currentPointers.splice(i2, 1), this.startPointers.splice(i2, 1), this.endCallback(t2, e2, this.currentPointers.slice()));
    }
    onWindowBlur() {
      this.clear();
    }
    clear() {
      for (; this.currentPointers.length; ) {
        const t2 = this.currentPointers[this.currentPointers.length - 1];
        this.currentPointers.splice(this.currentPointers.length - 1, 1), this.startPointers.splice(this.currentPointers.length - 1, 1), this.endCallback(new Event("touchend", { bubbles: true, cancelable: true, clientX: t2.clientX, clientY: t2.clientY }), t2, this.currentPointers.slice());
      }
    }
    stop() {
      this.element.removeEventListener("mousedown", this.onPointerStart, r), this.element.removeEventListener("touchstart", this.onTouchStart, r), this.element.removeEventListener("touchmove", this.onMove, r), this.element.removeEventListener("touchend", this.onTouchEnd), this.element.removeEventListener("touchcancel", this.onTouchEnd), window.removeEventListener("mousemove", this.onMove), window.removeEventListener("mouseup", this.onPointerEnd), window.removeEventListener("blur", this.onWindowBlur);
    }
  };
  function c(t2, e2) {
    return e2 ? Math.sqrt(Math.pow(e2.clientX - t2.clientX, 2) + Math.pow(e2.clientY - t2.clientY, 2)) : 0;
  }
  function h(t2, e2) {
    return e2 ? { clientX: (t2.clientX + e2.clientX) / 2, clientY: (t2.clientY + e2.clientY) / 2 } : t2;
  }
  var d = (t2) => "object" == typeof t2 && null !== t2 && t2.constructor === Object && "[object Object]" === Object.prototype.toString.call(t2);
  var u = (t2, ...e2) => {
    const i2 = e2.length;
    for (let n2 = 0; n2 < i2; n2++) {
      const i3 = e2[n2] || {};
      Object.entries(i3).forEach(([e3, i4]) => {
        const n3 = Array.isArray(i4) ? [] : {};
        t2[e3] || Object.assign(t2, { [e3]: n3 }), d(i4) ? Object.assign(t2[e3], u(n3, i4)) : Array.isArray(i4) ? Object.assign(t2, { [e3]: [...i4] }) : Object.assign(t2, { [e3]: i4 });
      });
    }
    return t2;
  };
  var p = function(t2, e2) {
    return t2.split(".").reduce((t3, e3) => "object" == typeof t3 ? t3[e3] : void 0, e2);
  };
  var f = class {
    constructor(t2 = {}) {
      Object.defineProperty(this, "options", { enumerable: true, configurable: true, writable: true, value: t2 }), Object.defineProperty(this, "events", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), this.setOptions(t2);
      for (const t3 of Object.getOwnPropertyNames(Object.getPrototypeOf(this)))
        t3.startsWith("on") && "function" == typeof this[t3] && (this[t3] = this[t3].bind(this));
    }
    setOptions(t2) {
      this.options = t2 ? u({}, this.constructor.defaults, t2) : {};
      for (const [t3, e2] of Object.entries(this.option("on") || {}))
        this.on(t3, e2);
    }
    option(t2, ...e2) {
      let i2 = p(t2, this.options);
      return i2 && "function" == typeof i2 && (i2 = i2.call(this, this, ...e2)), i2;
    }
    optionFor(t2, e2, i2, ...n2) {
      let s2 = p(e2, t2);
      var o2;
      "string" != typeof (o2 = s2) || isNaN(o2) || isNaN(parseFloat(o2)) || (s2 = parseFloat(s2)), "true" === s2 && (s2 = true), "false" === s2 && (s2 = false), s2 && "function" == typeof s2 && (s2 = s2.call(this, this, t2, ...n2));
      let a2 = p(e2, this.options);
      return a2 && "function" == typeof a2 ? s2 = a2.call(this, this, t2, ...n2, s2) : void 0 === s2 && (s2 = a2), void 0 === s2 ? i2 : s2;
    }
    cn(t2) {
      const e2 = this.options.classes;
      return e2 && e2[t2] || "";
    }
    localize(t2, e2 = []) {
      t2 = String(t2).replace(/\{\{(\w+).?(\w+)?\}\}/g, (t3, e3, i2) => {
        let n2 = "";
        return i2 ? n2 = this.option(`${e3[0] + e3.toLowerCase().substring(1)}.l10n.${i2}`) : e3 && (n2 = this.option(`l10n.${e3}`)), n2 || (n2 = t3), n2;
      });
      for (let i2 = 0; i2 < e2.length; i2++)
        t2 = t2.split(e2[i2][0]).join(e2[i2][1]);
      return t2 = t2.replace(/\{\{(.*?)\}\}/g, (t3, e3) => e3);
    }
    on(t2, e2) {
      let i2 = [];
      "string" == typeof t2 ? i2 = t2.split(" ") : Array.isArray(t2) && (i2 = t2), this.events || (this.events = /* @__PURE__ */ new Map()), i2.forEach((t3) => {
        let i3 = this.events.get(t3);
        i3 || (this.events.set(t3, []), i3 = []), i3.includes(e2) || i3.push(e2), this.events.set(t3, i3);
      });
    }
    off(t2, e2) {
      let i2 = [];
      "string" == typeof t2 ? i2 = t2.split(" ") : Array.isArray(t2) && (i2 = t2), i2.forEach((t3) => {
        const i3 = this.events.get(t3);
        if (Array.isArray(i3)) {
          const t4 = i3.indexOf(e2);
          t4 > -1 && i3.splice(t4, 1);
        }
      });
    }
    emit(t2, ...e2) {
      [...this.events.get(t2) || []].forEach((t3) => t3(this, ...e2)), "*" !== t2 && this.emit("*", t2, ...e2);
    }
  };
  Object.defineProperty(f, "version", { enumerable: true, configurable: true, writable: true, value: "5.0.33" }), Object.defineProperty(f, "defaults", { enumerable: true, configurable: true, writable: true, value: {} });
  var g = class extends f {
    constructor(t2 = {}) {
      super(t2), Object.defineProperty(this, "plugins", { enumerable: true, configurable: true, writable: true, value: {} });
    }
    attachPlugins(t2 = {}) {
      const e2 = /* @__PURE__ */ new Map();
      for (const [i2, n2] of Object.entries(t2)) {
        const t3 = this.option(i2), s2 = this.plugins[i2];
        s2 || false === t3 ? s2 && false === t3 && (s2.detach(), delete this.plugins[i2]) : e2.set(i2, new n2(this, t3 || {}));
      }
      for (const [t3, i2] of e2)
        this.plugins[t3] = i2, i2.attach();
    }
    detachPlugins(t2) {
      t2 = t2 || Object.keys(this.plugins);
      for (const e2 of t2) {
        const t3 = this.plugins[e2];
        t3 && t3.detach(), delete this.plugins[e2];
      }
      return this.emit("detachPlugins"), this;
    }
  };
  var m;
  !function(t2) {
    t2[t2.Init = 0] = "Init", t2[t2.Error = 1] = "Error", t2[t2.Ready = 2] = "Ready", t2[t2.Panning = 3] = "Panning", t2[t2.Mousemove = 4] = "Mousemove", t2[t2.Destroy = 5] = "Destroy";
  }(m || (m = {}));
  var v = ["a", "b", "c", "d", "e", "f"];
  var b = { PANUP: "Move up", PANDOWN: "Move down", PANLEFT: "Move left", PANRIGHT: "Move right", ZOOMIN: "Zoom in", ZOOMOUT: "Zoom out", TOGGLEZOOM: "Toggle zoom level", TOGGLE1TO1: "Toggle zoom level", ITERATEZOOM: "Toggle zoom level", ROTATECCW: "Rotate counterclockwise", ROTATECW: "Rotate clockwise", FLIPX: "Flip horizontally", FLIPY: "Flip vertically", FITX: "Fit horizontally", FITY: "Fit vertically", RESET: "Reset", TOGGLEFS: "Toggle fullscreen" };
  var y = { content: null, width: "auto", height: "auto", panMode: "drag", touch: true, dragMinThreshold: 3, lockAxis: false, mouseMoveFactor: 1, mouseMoveFriction: 0.12, zoom: true, pinchToZoom: true, panOnlyZoomed: "auto", minScale: 1, maxScale: 2, friction: 0.25, dragFriction: 0.35, decelFriction: 0.05, click: "toggleZoom", dblClick: false, wheel: "zoom", wheelLimit: 7, spinner: true, bounds: "auto", infinite: false, rubberband: true, bounce: true, maxVelocity: 75, transformParent: false, classes: { content: "f-panzoom__content", isLoading: "is-loading", canZoomIn: "can-zoom_in", canZoomOut: "can-zoom_out", isDraggable: "is-draggable", isDragging: "is-dragging", inFullscreen: "in-fullscreen", htmlHasFullscreen: "with-panzoom-in-fullscreen" }, l10n: b };
  var w = '<circle cx="25" cy="25" r="20"></circle>';
  var x = '<div class="f-spinner"><svg viewBox="0 0 50 50">' + w + w + "</svg></div>";
  var E = (t2) => t2 && null !== t2 && t2 instanceof Element && "nodeType" in t2;
  var S = (t2, e2) => {
    t2 && s(e2).forEach((e3) => {
      t2.classList.remove(e3);
    });
  };
  var P = (t2, e2) => {
    t2 && s(e2).forEach((e3) => {
      t2.classList.add(e3);
    });
  };
  var C = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
  var T = 1e5;
  var M = 1e4;
  var O = "mousemove";
  var A = "drag";
  var L = "content";
  var z = null;
  var R = null;
  var k = class _k extends g {
    get fits() {
      return this.contentRect.width - this.contentRect.fitWidth < 1 && this.contentRect.height - this.contentRect.fitHeight < 1;
    }
    get isTouchDevice() {
      return null === R && (R = window.matchMedia("(hover: none)").matches), R;
    }
    get isMobile() {
      return null === z && (z = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)), z;
    }
    get panMode() {
      return this.options.panMode !== O || this.isTouchDevice ? A : O;
    }
    get panOnlyZoomed() {
      const t2 = this.options.panOnlyZoomed;
      return "auto" === t2 ? this.isTouchDevice : t2;
    }
    get isInfinite() {
      return this.option("infinite");
    }
    get angle() {
      return 180 * Math.atan2(this.current.b, this.current.a) / Math.PI || 0;
    }
    get targetAngle() {
      return 180 * Math.atan2(this.target.b, this.target.a) / Math.PI || 0;
    }
    get scale() {
      const { a: t2, b: e2 } = this.current;
      return Math.sqrt(t2 * t2 + e2 * e2) || 1;
    }
    get targetScale() {
      const { a: t2, b: e2 } = this.target;
      return Math.sqrt(t2 * t2 + e2 * e2) || 1;
    }
    get minScale() {
      return this.option("minScale") || 1;
    }
    get fullScale() {
      const { contentRect: t2 } = this;
      return t2.fullWidth / t2.fitWidth || 1;
    }
    get maxScale() {
      return this.fullScale * (this.option("maxScale") || 1) || 1;
    }
    get coverScale() {
      const { containerRect: t2, contentRect: e2 } = this, i2 = Math.max(t2.height / e2.fitHeight, t2.width / e2.fitWidth) || 1;
      return Math.min(this.fullScale, i2);
    }
    get isScaling() {
      return Math.abs(this.targetScale - this.scale) > 1e-5 && !this.isResting;
    }
    get isContentLoading() {
      const t2 = this.content;
      return !!(t2 && t2 instanceof HTMLImageElement) && !t2.complete;
    }
    get isResting() {
      if (this.isBouncingX || this.isBouncingY)
        return false;
      for (const t2 of v) {
        const e2 = "e" == t2 || "f" === t2 ? 1e-4 : 1e-5;
        if (Math.abs(this.target[t2] - this.current[t2]) > e2)
          return false;
      }
      return !(!this.ignoreBounds && !this.checkBounds().inBounds);
    }
    constructor(t2, e2 = {}, i2 = {}) {
      var s2;
      if (super(e2), Object.defineProperty(this, "pointerTracker", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "resizeObserver", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "updateTimer", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "clickTimer", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "rAF", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "isTicking", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "ignoreBounds", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "isBouncingX", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "isBouncingY", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "clicks", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "trackingPoints", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "pwt", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "cwd", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "pmme", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "friction", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "state", { enumerable: true, configurable: true, writable: true, value: m.Init }), Object.defineProperty(this, "isDragging", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "container", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "content", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "spinner", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "containerRect", { enumerable: true, configurable: true, writable: true, value: { width: 0, height: 0, innerWidth: 0, innerHeight: 0 } }), Object.defineProperty(this, "contentRect", { enumerable: true, configurable: true, writable: true, value: { top: 0, right: 0, bottom: 0, left: 0, fullWidth: 0, fullHeight: 0, fitWidth: 0, fitHeight: 0, width: 0, height: 0 } }), Object.defineProperty(this, "dragStart", { enumerable: true, configurable: true, writable: true, value: { x: 0, y: 0, top: 0, left: 0, time: 0 } }), Object.defineProperty(this, "dragOffset", { enumerable: true, configurable: true, writable: true, value: { x: 0, y: 0, time: 0 } }), Object.defineProperty(this, "current", { enumerable: true, configurable: true, writable: true, value: Object.assign({}, C) }), Object.defineProperty(this, "target", { enumerable: true, configurable: true, writable: true, value: Object.assign({}, C) }), Object.defineProperty(this, "velocity", { enumerable: true, configurable: true, writable: true, value: { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0 } }), Object.defineProperty(this, "lockedAxis", { enumerable: true, configurable: true, writable: true, value: false }), !t2)
        throw new Error("Container Element Not Found");
      this.container = t2, this.initContent(), this.attachPlugins(Object.assign(Object.assign({}, _k.Plugins), i2)), this.emit("attachPlugins"), this.emit("init");
      const o2 = this.content;
      if (o2.addEventListener("load", this.onLoad), o2.addEventListener("error", this.onError), this.isContentLoading) {
        if (this.option("spinner")) {
          t2.classList.add(this.cn("isLoading"));
          const e3 = n(x);
          !t2.contains(o2) || o2.parentElement instanceof HTMLPictureElement ? this.spinner = t2.appendChild(e3) : this.spinner = (null === (s2 = o2.parentElement) || void 0 === s2 ? void 0 : s2.insertBefore(e3, o2)) || null;
        }
        this.emit("beforeLoad");
      } else
        queueMicrotask(() => {
          this.enable();
        });
    }
    initContent() {
      const { container: t2 } = this, e2 = this.cn(L);
      let i2 = this.option(L) || t2.querySelector(`.${e2}`);
      if (i2 || (i2 = t2.querySelector("img,picture") || t2.firstElementChild, i2 && P(i2, e2)), i2 instanceof HTMLPictureElement && (i2 = i2.querySelector("img")), !i2)
        throw new Error("No content found");
      this.content = i2;
    }
    onLoad() {
      const { spinner: t2, container: e2, state: i2 } = this;
      t2 && (t2.remove(), this.spinner = null), this.option("spinner") && e2.classList.remove(this.cn("isLoading")), this.emit("afterLoad"), i2 === m.Init ? this.enable() : this.updateMetrics();
    }
    onError() {
      this.state !== m.Destroy && (this.spinner && (this.spinner.remove(), this.spinner = null), this.stop(), this.detachEvents(), this.state = m.Error, this.emit("error"));
    }
    getNextScale(t2) {
      const { fullScale: e2, targetScale: i2, coverScale: n2, maxScale: s2, minScale: o2 } = this;
      let a2 = o2;
      switch (t2) {
        case "toggleMax":
          a2 = i2 - o2 < 0.5 * (s2 - o2) ? s2 : o2;
          break;
        case "toggleCover":
          a2 = i2 - o2 < 0.5 * (n2 - o2) ? n2 : o2;
          break;
        case "toggleZoom":
          a2 = i2 - o2 < 0.5 * (e2 - o2) ? e2 : o2;
          break;
        case "iterateZoom":
          let t3 = [1, e2, s2].sort((t4, e3) => t4 - e3), r2 = t3.findIndex((t4) => t4 > i2 + 1e-5);
          a2 = t3[r2] || 1;
      }
      return a2;
    }
    attachObserver() {
      var t2;
      const e2 = () => {
        const { container: t3, containerRect: e3 } = this;
        return Math.abs(e3.width - t3.getBoundingClientRect().width) > 0.1 || Math.abs(e3.height - t3.getBoundingClientRect().height) > 0.1;
      };
      this.resizeObserver || void 0 === window.ResizeObserver || (this.resizeObserver = new ResizeObserver(() => {
        this.updateTimer || (e2() ? (this.onResize(), this.isMobile && (this.updateTimer = setTimeout(() => {
          e2() && this.onResize(), this.updateTimer = null;
        }, 500))) : this.updateTimer && (clearTimeout(this.updateTimer), this.updateTimer = null));
      })), null === (t2 = this.resizeObserver) || void 0 === t2 || t2.observe(this.container);
    }
    detachObserver() {
      var t2;
      null === (t2 = this.resizeObserver) || void 0 === t2 || t2.disconnect();
    }
    attachEvents() {
      const { container: t2 } = this;
      t2.addEventListener("click", this.onClick, { passive: false, capture: false }), t2.addEventListener("wheel", this.onWheel, { passive: false }), this.pointerTracker = new l(t2, { start: this.onPointerDown, move: this.onPointerMove, end: this.onPointerUp }), document.addEventListener(O, this.onMouseMove);
    }
    detachEvents() {
      var t2;
      const { container: e2 } = this;
      e2.removeEventListener("click", this.onClick, { passive: false, capture: false }), e2.removeEventListener("wheel", this.onWheel, { passive: false }), null === (t2 = this.pointerTracker) || void 0 === t2 || t2.stop(), this.pointerTracker = null, document.removeEventListener(O, this.onMouseMove), document.removeEventListener("keydown", this.onKeydown, true), this.clickTimer && (clearTimeout(this.clickTimer), this.clickTimer = null), this.updateTimer && (clearTimeout(this.updateTimer), this.updateTimer = null);
    }
    animate() {
      this.setTargetForce();
      const t2 = this.friction, e2 = this.option("maxVelocity");
      for (const i2 of v)
        t2 ? (this.velocity[i2] *= 1 - t2, e2 && !this.isScaling && (this.velocity[i2] = Math.max(Math.min(this.velocity[i2], e2), -1 * e2)), this.current[i2] += this.velocity[i2]) : this.current[i2] = this.target[i2];
      this.setTransform(), this.setEdgeForce(), !this.isResting || this.isDragging ? this.rAF = requestAnimationFrame(() => this.animate()) : this.stop("current");
    }
    setTargetForce() {
      for (const t2 of v)
        "e" === t2 && this.isBouncingX || "f" === t2 && this.isBouncingY || (this.velocity[t2] = (1 / (1 - this.friction) - 1) * (this.target[t2] - this.current[t2]));
    }
    checkBounds(t2 = 0, e2 = 0) {
      const { current: i2 } = this, n2 = i2.e + t2, s2 = i2.f + e2, o2 = this.getBounds(), { x: a2, y: r2 } = o2, l2 = a2.min, c2 = a2.max, h2 = r2.min, d2 = r2.max;
      let u2 = 0, p2 = 0;
      return l2 !== 1 / 0 && n2 < l2 ? u2 = l2 - n2 : c2 !== 1 / 0 && n2 > c2 && (u2 = c2 - n2), h2 !== 1 / 0 && s2 < h2 ? p2 = h2 - s2 : d2 !== 1 / 0 && s2 > d2 && (p2 = d2 - s2), Math.abs(u2) < 1e-4 && (u2 = 0), Math.abs(p2) < 1e-4 && (p2 = 0), Object.assign(Object.assign({}, o2), { xDiff: u2, yDiff: p2, inBounds: !u2 && !p2 });
    }
    clampTargetBounds() {
      const { target: t2 } = this, { x: e2, y: i2 } = this.getBounds();
      e2.min !== 1 / 0 && (t2.e = Math.max(t2.e, e2.min)), e2.max !== 1 / 0 && (t2.e = Math.min(t2.e, e2.max)), i2.min !== 1 / 0 && (t2.f = Math.max(t2.f, i2.min)), i2.max !== 1 / 0 && (t2.f = Math.min(t2.f, i2.max));
    }
    calculateContentDim(t2 = this.current) {
      const { content: e2, contentRect: i2 } = this, { fitWidth: n2, fitHeight: s2, fullWidth: o2, fullHeight: a2 } = i2;
      let r2 = o2, l2 = a2;
      if (this.option("zoom") || 0 !== this.angle) {
        const i3 = !(e2 instanceof HTMLImageElement) && ("none" === window.getComputedStyle(e2).maxWidth || "none" === window.getComputedStyle(e2).maxHeight), c2 = i3 ? o2 : n2, h2 = i3 ? a2 : s2, d2 = this.getMatrix(t2), u2 = new DOMPoint(0, 0).matrixTransform(d2), p2 = new DOMPoint(0 + c2, 0).matrixTransform(d2), f2 = new DOMPoint(0 + c2, 0 + h2).matrixTransform(d2), g2 = new DOMPoint(0, 0 + h2).matrixTransform(d2), m2 = Math.abs(f2.x - u2.x), v2 = Math.abs(f2.y - u2.y), b2 = Math.abs(g2.x - p2.x), y2 = Math.abs(g2.y - p2.y);
        r2 = Math.max(m2, b2), l2 = Math.max(v2, y2);
      }
      return { contentWidth: r2, contentHeight: l2 };
    }
    setEdgeForce() {
      if (this.ignoreBounds || this.isDragging || this.panMode === O || this.targetScale < this.scale)
        return this.isBouncingX = false, void (this.isBouncingY = false);
      const { target: t2 } = this, { x: e2, y: i2, xDiff: n2, yDiff: s2 } = this.checkBounds();
      const o2 = this.option("maxVelocity");
      let a2 = this.velocity.e, r2 = this.velocity.f;
      0 !== n2 ? (this.isBouncingX = true, n2 * a2 <= 0 ? a2 += 0.14 * n2 : (a2 = 0.14 * n2, e2.min !== 1 / 0 && (this.target.e = Math.max(t2.e, e2.min)), e2.max !== 1 / 0 && (this.target.e = Math.min(t2.e, e2.max))), o2 && (a2 = Math.max(Math.min(a2, o2), -1 * o2))) : this.isBouncingX = false, 0 !== s2 ? (this.isBouncingY = true, s2 * r2 <= 0 ? r2 += 0.14 * s2 : (r2 = 0.14 * s2, i2.min !== 1 / 0 && (this.target.f = Math.max(t2.f, i2.min)), i2.max !== 1 / 0 && (this.target.f = Math.min(t2.f, i2.max))), o2 && (r2 = Math.max(Math.min(r2, o2), -1 * o2))) : this.isBouncingY = false, this.isBouncingX && (this.velocity.e = a2), this.isBouncingY && (this.velocity.f = r2);
    }
    enable() {
      const { content: t2 } = this, e2 = new DOMMatrixReadOnly(window.getComputedStyle(t2).transform);
      for (const t3 of v)
        this.current[t3] = this.target[t3] = e2[t3];
      this.updateMetrics(), this.attachObserver(), this.attachEvents(), this.state = m.Ready, this.emit("ready");
    }
    onClick(t2) {
      var e2;
      "click" === t2.type && 0 === t2.detail && (this.dragOffset.x = 0, this.dragOffset.y = 0), this.isDragging && (null === (e2 = this.pointerTracker) || void 0 === e2 || e2.clear(), this.trackingPoints = [], this.startDecelAnim());
      const i2 = t2.target;
      if (!i2 || t2.defaultPrevented)
        return;
      if (i2.hasAttribute("disabled"))
        return t2.preventDefault(), void t2.stopPropagation();
      if ((() => {
        const t3 = window.getSelection();
        return t3 && "Range" === t3.type;
      })() && !i2.closest("button"))
        return;
      const n2 = i2.closest("[data-panzoom-action]"), s2 = i2.closest("[data-panzoom-change]"), o2 = n2 || s2, a2 = o2 && E(o2) ? o2.dataset : null;
      if (a2) {
        const e3 = a2.panzoomChange, i3 = a2.panzoomAction;
        if ((e3 || i3) && t2.preventDefault(), e3) {
          let t3 = {};
          try {
            t3 = JSON.parse(e3);
          } catch (t4) {
            console && console.warn("The given data was not valid JSON");
          }
          return void this.applyChange(t3);
        }
        if (i3)
          return void (this[i3] && this[i3]());
      }
      if (Math.abs(this.dragOffset.x) > 3 || Math.abs(this.dragOffset.y) > 3)
        return t2.preventDefault(), void t2.stopPropagation();
      if (i2.closest("[data-fancybox]"))
        return;
      const r2 = this.content.getBoundingClientRect(), l2 = this.dragStart;
      if (l2.time && !this.canZoomOut() && (Math.abs(r2.x - l2.x) > 2 || Math.abs(r2.y - l2.y) > 2))
        return;
      this.dragStart.time = 0;
      const c2 = (e3) => {
        this.option("zoom", t2) && e3 && "string" == typeof e3 && /(iterateZoom)|(toggle(Zoom|Full|Cover|Max)|(zoomTo(Fit|Cover|Max)))/.test(e3) && "function" == typeof this[e3] && (t2.preventDefault(), this[e3]({ event: t2 }));
      }, h2 = this.option("click", t2), d2 = this.option("dblClick", t2);
      d2 ? (this.clicks++, 1 == this.clicks && (this.clickTimer = setTimeout(() => {
        1 === this.clicks ? (this.emit("click", t2), !t2.defaultPrevented && h2 && c2(h2)) : (this.emit("dblClick", t2), t2.defaultPrevented || c2(d2)), this.clicks = 0, this.clickTimer = null;
      }, 350))) : (this.emit("click", t2), !t2.defaultPrevented && h2 && c2(h2));
    }
    addTrackingPoint(t2) {
      const e2 = this.trackingPoints.filter((t3) => t3.time > Date.now() - 100);
      e2.push(t2), this.trackingPoints = e2;
    }
    onPointerDown(t2, e2, i2) {
      var n2;
      if (false === this.option("touch", t2))
        return false;
      this.pwt = 0, this.dragOffset = { x: 0, y: 0, time: 0 }, this.trackingPoints = [];
      const s2 = this.content.getBoundingClientRect();
      if (this.dragStart = { x: s2.x, y: s2.y, top: s2.top, left: s2.left, time: Date.now() }, this.clickTimer)
        return false;
      if (this.panMode === O && this.targetScale > 1)
        return t2.preventDefault(), t2.stopPropagation(), false;
      const o2 = t2.composedPath()[0];
      if (!i2.length) {
        if (["TEXTAREA", "OPTION", "INPUT", "SELECT", "VIDEO", "IFRAME"].includes(o2.nodeName) || o2.closest("[contenteditable],[data-selectable],[data-draggable],[data-clickable],[data-panzoom-change],[data-panzoom-action]"))
          return false;
        null === (n2 = window.getSelection()) || void 0 === n2 || n2.removeAllRanges();
      }
      if ("mousedown" === t2.type)
        ["A", "BUTTON"].includes(o2.nodeName) || t2.preventDefault();
      else if (Math.abs(this.velocity.a) > 0.3)
        return false;
      return this.target.e = this.current.e, this.target.f = this.current.f, this.stop(), this.isDragging || (this.isDragging = true, this.addTrackingPoint(e2), this.emit("touchStart", t2)), true;
    }
    onPointerMove(e2, n2, s2) {
      if (false === this.option("touch", e2))
        return;
      if (!this.isDragging)
        return;
      if (n2.length < 2 && this.panOnlyZoomed && t(this.targetScale) <= t(this.minScale))
        return;
      if (this.emit("touchMove", e2), e2.defaultPrevented)
        return;
      this.addTrackingPoint(n2[0]);
      const { content: o2 } = this, a2 = h(s2[0], s2[1]), r2 = h(n2[0], n2[1]);
      let l2 = 0, d2 = 0;
      if (n2.length > 1) {
        const t2 = o2.getBoundingClientRect();
        l2 = a2.clientX - t2.left - 0.5 * t2.width, d2 = a2.clientY - t2.top - 0.5 * t2.height;
      }
      const u2 = c(s2[0], s2[1]), p2 = c(n2[0], n2[1]);
      let f2 = u2 ? p2 / u2 : 1, g2 = r2.clientX - a2.clientX, m2 = r2.clientY - a2.clientY;
      this.dragOffset.x += g2, this.dragOffset.y += m2, this.dragOffset.time = Date.now() - this.dragStart.time;
      let v2 = t(this.targetScale) === t(this.minScale) && this.option("lockAxis");
      if (v2 && !this.lockedAxis)
        if ("xy" === v2 || "y" === v2 || "touchmove" === e2.type) {
          if (Math.abs(this.dragOffset.x) < 6 && Math.abs(this.dragOffset.y) < 6)
            return void e2.preventDefault();
          const t2 = Math.abs(180 * Math.atan2(this.dragOffset.y, this.dragOffset.x) / Math.PI);
          this.lockedAxis = t2 > 45 && t2 < 135 ? "y" : "x", this.dragOffset.x = 0, this.dragOffset.y = 0, g2 = 0, m2 = 0;
        } else
          this.lockedAxis = v2;
      if (i(e2.target, this.content) && (v2 = "x", this.dragOffset.y = 0), v2 && "xy" !== v2 && this.lockedAxis !== v2 && t(this.targetScale) === t(this.minScale))
        return;
      e2.cancelable && e2.preventDefault(), this.container.classList.add(this.cn("isDragging"));
      const b2 = this.checkBounds(g2, m2);
      this.option("rubberband") ? ("x" !== this.isInfinite && (b2.xDiff > 0 && g2 < 0 || b2.xDiff < 0 && g2 > 0) && (g2 *= Math.max(0, 0.5 - Math.abs(0.75 / this.contentRect.fitWidth * b2.xDiff))), "y" !== this.isInfinite && (b2.yDiff > 0 && m2 < 0 || b2.yDiff < 0 && m2 > 0) && (m2 *= Math.max(0, 0.5 - Math.abs(0.75 / this.contentRect.fitHeight * b2.yDiff)))) : (b2.xDiff && (g2 = 0), b2.yDiff && (m2 = 0));
      const y2 = this.targetScale, w2 = this.minScale, x2 = this.maxScale;
      y2 < 0.5 * w2 && (f2 = Math.max(f2, w2)), y2 > 1.5 * x2 && (f2 = Math.min(f2, x2)), "y" === this.lockedAxis && t(y2) === t(w2) && (g2 = 0), "x" === this.lockedAxis && t(y2) === t(w2) && (m2 = 0), this.applyChange({ originX: l2, originY: d2, panX: g2, panY: m2, scale: f2, friction: this.option("dragFriction"), ignoreBounds: true });
    }
    onPointerUp(t2, e2, n2) {
      if (n2.length)
        return this.dragOffset.x = 0, this.dragOffset.y = 0, void (this.trackingPoints = []);
      this.container.classList.remove(this.cn("isDragging")), this.isDragging && (this.addTrackingPoint(e2), this.panOnlyZoomed && this.contentRect.width - this.contentRect.fitWidth < 1 && this.contentRect.height - this.contentRect.fitHeight < 1 && (this.trackingPoints = []), i(t2.target, this.content) && "y" === this.lockedAxis && (this.trackingPoints = []), this.emit("touchEnd", t2), this.isDragging = false, this.lockedAxis = false, this.state !== m.Destroy && (t2.defaultPrevented || this.startDecelAnim()));
    }
    startDecelAnim() {
      var e2;
      const i2 = this.isScaling;
      this.rAF && (cancelAnimationFrame(this.rAF), this.rAF = null), this.isBouncingX = false, this.isBouncingY = false;
      for (const t2 of v)
        this.velocity[t2] = 0;
      this.target.e = this.current.e, this.target.f = this.current.f, S(this.container, "is-scaling"), S(this.container, "is-animating"), this.isTicking = false;
      const { trackingPoints: n2 } = this, s2 = n2[0], o2 = n2[n2.length - 1];
      let a2 = 0, r2 = 0, l2 = 0;
      o2 && s2 && (a2 = o2.clientX - s2.clientX, r2 = o2.clientY - s2.clientY, l2 = o2.time - s2.time);
      const c2 = (null === (e2 = window.visualViewport) || void 0 === e2 ? void 0 : e2.scale) || 1;
      1 !== c2 && (a2 *= c2, r2 *= c2);
      let h2 = 0, d2 = 0, u2 = 0, p2 = 0, f2 = this.option("decelFriction");
      const g2 = this.targetScale;
      if (l2 > 0) {
        u2 = Math.abs(a2) > 3 ? a2 / (l2 / 30) : 0, p2 = Math.abs(r2) > 3 ? r2 / (l2 / 30) : 0;
        const t2 = this.option("maxVelocity");
        t2 && (u2 = Math.max(Math.min(u2, t2), -1 * t2), p2 = Math.max(Math.min(p2, t2), -1 * t2));
      }
      u2 && (h2 = u2 / (1 / (1 - f2) - 1)), p2 && (d2 = p2 / (1 / (1 - f2) - 1)), ("y" === this.option("lockAxis") || "xy" === this.option("lockAxis") && "y" === this.lockedAxis && t(g2) === this.minScale) && (h2 = u2 = 0), ("x" === this.option("lockAxis") || "xy" === this.option("lockAxis") && "x" === this.lockedAxis && t(g2) === this.minScale) && (d2 = p2 = 0);
      const m2 = this.dragOffset.x, b2 = this.dragOffset.y, y2 = this.option("dragMinThreshold") || 0;
      Math.abs(m2) < y2 && Math.abs(b2) < y2 && (h2 = d2 = 0, u2 = p2 = 0), (this.option("zoom") && (g2 < this.minScale - 1e-5 || g2 > this.maxScale + 1e-5) || i2 && !h2 && !d2) && (f2 = 0.35), this.applyChange({ panX: h2, panY: d2, friction: f2 }), this.emit("decel", u2, p2, m2, b2);
    }
    onWheel(t2) {
      var e2 = [-t2.deltaX || 0, -t2.deltaY || 0, -t2.detail || 0].reduce(function(t3, e3) {
        return Math.abs(e3) > Math.abs(t3) ? e3 : t3;
      });
      const i2 = Math.max(-1, Math.min(1, e2));
      if (this.emit("wheel", t2, i2), this.panMode === O)
        return;
      if (t2.defaultPrevented)
        return;
      const n2 = this.option("wheel");
      "pan" === n2 ? (t2.preventDefault(), this.panOnlyZoomed && !this.canZoomOut() || this.applyChange({ panX: 2 * -t2.deltaX, panY: 2 * -t2.deltaY, bounce: false })) : "zoom" === n2 && false !== this.option("zoom") && this.zoomWithWheel(t2);
    }
    onMouseMove(t2) {
      this.panWithMouse(t2);
    }
    onKeydown(t2) {
      "Escape" === t2.key && this.toggleFS();
    }
    onResize() {
      this.updateMetrics(), this.checkBounds().inBounds || this.requestTick();
    }
    setTransform() {
      this.emit("beforeTransform");
      const { current: e2, target: i2, content: n2, contentRect: s2 } = this, o2 = Object.assign({}, C);
      for (const n3 of v) {
        const s3 = "e" == n3 || "f" === n3 ? M : T;
        o2[n3] = t(e2[n3], s3), Math.abs(i2[n3] - e2[n3]) < ("e" == n3 || "f" === n3 ? 0.51 : 1e-3) && (e2[n3] = i2[n3]);
      }
      let { a: a2, b: r2, c: l2, d: c2, e: h2, f: d2 } = o2, u2 = `matrix(${a2}, ${r2}, ${l2}, ${c2}, ${h2}, ${d2})`, p2 = n2.parentElement instanceof HTMLPictureElement ? n2.parentElement : n2;
      if (this.option("transformParent") && (p2 = p2.parentElement || p2), p2.style.transform === u2)
        return;
      p2.style.transform = u2;
      const { contentWidth: f2, contentHeight: g2 } = this.calculateContentDim();
      s2.width = f2, s2.height = g2, this.emit("afterTransform");
    }
    updateMetrics(e2 = false) {
      var i2;
      if (!this || this.state === m.Destroy)
        return;
      if (this.isContentLoading)
        return;
      const n2 = Math.max(1, (null === (i2 = window.visualViewport) || void 0 === i2 ? void 0 : i2.scale) || 1), { container: s2, content: o2 } = this, a2 = o2 instanceof HTMLImageElement, r2 = s2.getBoundingClientRect(), l2 = getComputedStyle(this.container);
      let c2 = r2.width * n2, h2 = r2.height * n2;
      const d2 = parseFloat(l2.paddingTop) + parseFloat(l2.paddingBottom), u2 = c2 - (parseFloat(l2.paddingLeft) + parseFloat(l2.paddingRight)), p2 = h2 - d2;
      this.containerRect = { width: c2, height: h2, innerWidth: u2, innerHeight: p2 };
      let f2 = this.option("width") || "auto", g2 = this.option("height") || "auto";
      "auto" === f2 && (f2 = parseFloat(o2.dataset.width || "") || ((t2) => {
        let e3 = 0;
        return e3 = t2 instanceof HTMLImageElement ? t2.naturalWidth : t2 instanceof SVGElement ? t2.width.baseVal.value : Math.max(t2.offsetWidth, t2.scrollWidth), e3 || 0;
      })(o2)), "auto" === g2 && (g2 = parseFloat(o2.dataset.height || "") || ((t2) => {
        let e3 = 0;
        return e3 = t2 instanceof HTMLImageElement ? t2.naturalHeight : t2 instanceof SVGElement ? t2.height.baseVal.value : Math.max(t2.offsetHeight, t2.scrollHeight), e3 || 0;
      })(o2));
      let v2 = o2.parentElement instanceof HTMLPictureElement ? o2.parentElement : o2;
      this.option("transformParent") && (v2 = v2.parentElement || v2);
      const b2 = v2.getAttribute("style") || "";
      v2.style.setProperty("transform", "none", "important"), a2 && (v2.style.width = "", v2.style.height = ""), v2.offsetHeight;
      const y2 = o2.getBoundingClientRect();
      let w2 = y2.width * n2, x2 = y2.height * n2, E2 = 0, S2 = 0;
      a2 && (Math.abs(f2 - w2) > 1 || Math.abs(g2 - x2) > 1) && ({ width: w2, height: x2, top: E2, left: S2 } = ((t2, e3, i3, n3) => {
        const s3 = i3 / n3;
        return s3 > t2 / e3 ? (i3 = t2, n3 = t2 / s3) : (i3 = e3 * s3, n3 = e3), { width: i3, height: n3, top: 0.5 * (e3 - n3), left: 0.5 * (t2 - i3) };
      })(w2, x2, f2, g2)), this.contentRect = Object.assign(Object.assign({}, this.contentRect), { top: y2.top - r2.top + E2, bottom: r2.bottom - y2.bottom + E2, left: y2.left - r2.left + S2, right: r2.right - y2.right + S2, fitWidth: w2, fitHeight: x2, width: w2, height: x2, fullWidth: f2, fullHeight: g2 }), v2.style.cssText = b2, a2 && (v2.style.width = `${w2}px`, v2.style.height = `${x2}px`), this.setTransform(), true !== e2 && this.emit("refresh"), this.ignoreBounds || (t(this.targetScale) < t(this.minScale) ? this.zoomTo(this.minScale, { friction: 0 }) : this.targetScale > this.maxScale ? this.zoomTo(this.maxScale, { friction: 0 }) : this.state === m.Init || this.checkBounds().inBounds || this.requestTick()), this.updateControls();
    }
    calculateBounds() {
      const { contentWidth: e2, contentHeight: i2 } = this.calculateContentDim(this.target), { targetScale: n2, lockedAxis: s2 } = this, { fitWidth: o2, fitHeight: a2 } = this.contentRect;
      let r2 = 0, l2 = 0, c2 = 0, h2 = 0;
      const d2 = this.option("infinite");
      if (true === d2 || s2 && d2 === s2)
        r2 = -1 / 0, c2 = 1 / 0, l2 = -1 / 0, h2 = 1 / 0;
      else {
        let { containerRect: s3, contentRect: d3 } = this, u2 = t(o2 * n2, M), p2 = t(a2 * n2, M), { innerWidth: f2, innerHeight: g2 } = s3;
        if (s3.width === u2 && (f2 = s3.width), s3.width === p2 && (g2 = s3.height), e2 > f2) {
          c2 = 0.5 * (e2 - f2), r2 = -1 * c2;
          let t2 = 0.5 * (d3.right - d3.left);
          r2 += t2, c2 += t2;
        }
        if (o2 > f2 && e2 < f2 && (r2 -= 0.5 * (o2 - f2), c2 -= 0.5 * (o2 - f2)), i2 > g2) {
          h2 = 0.5 * (i2 - g2), l2 = -1 * h2;
          let t2 = 0.5 * (d3.bottom - d3.top);
          l2 += t2, h2 += t2;
        }
        a2 > g2 && i2 < g2 && (r2 -= 0.5 * (a2 - g2), c2 -= 0.5 * (a2 - g2));
      }
      return { x: { min: r2, max: c2 }, y: { min: l2, max: h2 } };
    }
    getBounds() {
      const t2 = this.option("bounds");
      return "auto" !== t2 ? t2 : this.calculateBounds();
    }
    updateControls() {
      const e2 = this, i2 = e2.container, { panMode: n2, contentRect: s2, targetScale: a2, minScale: r2 } = e2;
      let l2 = r2, c2 = e2.option("click") || false;
      c2 && (l2 = e2.getNextScale(c2));
      let h2 = e2.canZoomIn(), d2 = e2.canZoomOut(), u2 = n2 === A && !!this.option("touch"), p2 = d2 && u2;
      if (u2 && (t(a2) < t(r2) && !this.panOnlyZoomed && (p2 = true), (t(s2.width, 1) > t(s2.fitWidth, 1) || t(s2.height, 1) > t(s2.fitHeight, 1)) && (p2 = true)), t(s2.width * a2, 1) < t(s2.fitWidth, 1) && (p2 = false), n2 === O && (p2 = false), o(i2, this.cn("isDraggable"), p2), !this.option("zoom"))
        return;
      let f2 = h2 && t(l2) > t(a2), g2 = !f2 && !p2 && d2 && t(l2) < t(a2);
      o(i2, this.cn("canZoomIn"), f2), o(i2, this.cn("canZoomOut"), g2);
      for (const t2 of i2.querySelectorAll("[data-panzoom-action]")) {
        let e3 = false, i3 = false;
        switch (t2.dataset.panzoomAction) {
          case "zoomIn":
            h2 ? e3 = true : i3 = true;
            break;
          case "zoomOut":
            d2 ? e3 = true : i3 = true;
            break;
          case "toggleZoom":
          case "iterateZoom":
            h2 || d2 ? e3 = true : i3 = true;
            const n3 = t2.querySelector("g");
            n3 && (n3.style.display = h2 ? "" : "none");
        }
        e3 ? (t2.removeAttribute("disabled"), t2.removeAttribute("tabindex")) : i3 && (t2.setAttribute("disabled", ""), t2.setAttribute("tabindex", "-1"));
      }
    }
    panTo({ x: t2 = this.target.e, y: e2 = this.target.f, scale: i2 = this.targetScale, friction: n2 = this.option("friction"), angle: s2 = 0, originX: o2 = 0, originY: a2 = 0, flipX: r2 = false, flipY: l2 = false, ignoreBounds: c2 = false }) {
      this.state !== m.Destroy && this.applyChange({ panX: t2 - this.target.e, panY: e2 - this.target.f, scale: i2 / this.targetScale, angle: s2, originX: o2, originY: a2, friction: n2, flipX: r2, flipY: l2, ignoreBounds: c2 });
    }
    applyChange({ panX: e2 = 0, panY: i2 = 0, scale: n2 = 1, angle: s2 = 0, originX: o2 = -this.current.e, originY: a2 = -this.current.f, friction: r2 = this.option("friction"), flipX: l2 = false, flipY: c2 = false, ignoreBounds: h2 = false, bounce: d2 = this.option("bounce") }) {
      const u2 = this.state;
      if (u2 === m.Destroy)
        return;
      this.rAF && (cancelAnimationFrame(this.rAF), this.rAF = null), this.friction = r2 || 0, this.ignoreBounds = h2;
      const { current: p2 } = this, f2 = p2.e, g2 = p2.f, b2 = this.getMatrix(this.target);
      let y2 = new DOMMatrix().translate(f2, g2).translate(o2, a2).translate(e2, i2);
      if (this.option("zoom")) {
        if (!h2) {
          const t2 = this.targetScale, e3 = this.minScale, i3 = this.maxScale;
          t2 * n2 < e3 && (n2 = e3 / t2), t2 * n2 > i3 && (n2 = i3 / t2);
        }
        y2 = y2.scale(n2);
      }
      y2 = y2.translate(-o2, -a2).translate(-f2, -g2).multiply(b2), s2 && (y2 = y2.rotate(s2)), l2 && (y2 = y2.scale(-1, 1)), c2 && (y2 = y2.scale(1, -1));
      for (const e3 of v)
        "e" !== e3 && "f" !== e3 && (y2[e3] > this.minScale + 1e-5 || y2[e3] < this.minScale - 1e-5) ? this.target[e3] = y2[e3] : this.target[e3] = t(y2[e3], M);
      (this.targetScale < this.scale || Math.abs(n2 - 1) > 0.1 || this.panMode === O || false === d2) && !h2 && this.clampTargetBounds(), u2 === m.Init ? this.animate() : this.isResting || (this.state = m.Panning, this.requestTick());
    }
    stop(t2 = false) {
      if (this.state === m.Init || this.state === m.Destroy)
        return;
      const e2 = this.isTicking;
      this.rAF && (cancelAnimationFrame(this.rAF), this.rAF = null), this.isBouncingX = false, this.isBouncingY = false;
      for (const e3 of v)
        this.velocity[e3] = 0, "current" === t2 ? this.current[e3] = this.target[e3] : "target" === t2 && (this.target[e3] = this.current[e3]);
      this.setTransform(), S(this.container, "is-scaling"), S(this.container, "is-animating"), this.isTicking = false, this.state = m.Ready, e2 && (this.emit("endAnimation"), this.updateControls());
    }
    requestTick() {
      this.isTicking || (this.emit("startAnimation"), this.updateControls(), P(this.container, "is-animating"), this.isScaling && P(this.container, "is-scaling")), this.isTicking = true, this.rAF || (this.rAF = requestAnimationFrame(() => this.animate()));
    }
    panWithMouse(e2, i2 = this.option("mouseMoveFriction")) {
      if (this.pmme = e2, this.panMode !== O || !e2)
        return;
      if (t(this.targetScale) <= t(this.minScale))
        return;
      this.emit("mouseMove", e2);
      const { container: n2, containerRect: s2, contentRect: o2 } = this, a2 = s2.width, r2 = s2.height, l2 = n2.getBoundingClientRect(), c2 = (e2.clientX || 0) - l2.left, h2 = (e2.clientY || 0) - l2.top;
      let { contentWidth: d2, contentHeight: u2 } = this.calculateContentDim(this.target);
      const p2 = this.option("mouseMoveFactor");
      p2 > 1 && (d2 !== a2 && (d2 *= p2), u2 !== r2 && (u2 *= p2));
      let f2 = 0.5 * (d2 - a2) - c2 / a2 * 100 / 100 * (d2 - a2);
      f2 += 0.5 * (o2.right - o2.left);
      let g2 = 0.5 * (u2 - r2) - h2 / r2 * 100 / 100 * (u2 - r2);
      g2 += 0.5 * (o2.bottom - o2.top), this.applyChange({ panX: f2 - this.target.e, panY: g2 - this.target.f, friction: i2 });
    }
    zoomWithWheel(e2) {
      if (this.state === m.Destroy || this.state === m.Init)
        return;
      const i2 = Date.now();
      if (i2 - this.pwt < 45)
        return void e2.preventDefault();
      this.pwt = i2;
      var n2 = [-e2.deltaX || 0, -e2.deltaY || 0, -e2.detail || 0].reduce(function(t2, e3) {
        return Math.abs(e3) > Math.abs(t2) ? e3 : t2;
      });
      const s2 = Math.max(-1, Math.min(1, n2)), { targetScale: o2, maxScale: a2, minScale: r2 } = this;
      let l2 = o2 * (100 + 45 * s2) / 100;
      t(l2) < t(r2) && t(o2) <= t(r2) ? (this.cwd += Math.abs(s2), l2 = r2) : t(l2) > t(a2) && t(o2) >= t(a2) ? (this.cwd += Math.abs(s2), l2 = a2) : (this.cwd = 0, l2 = Math.max(Math.min(l2, a2), r2)), this.cwd > this.option("wheelLimit") || (e2.preventDefault(), t(l2) !== t(o2) && this.zoomTo(l2, { event: e2 }));
    }
    canZoomIn() {
      return this.option("zoom") && (t(this.contentRect.width, 1) < t(this.contentRect.fitWidth, 1) || t(this.targetScale) < t(this.maxScale));
    }
    canZoomOut() {
      return this.option("zoom") && t(this.targetScale) > t(this.minScale);
    }
    zoomIn(t2 = 1.25, e2) {
      this.zoomTo(this.targetScale * t2, e2);
    }
    zoomOut(t2 = 0.8, e2) {
      this.zoomTo(this.targetScale * t2, e2);
    }
    zoomToFit(t2) {
      this.zoomTo("fit", t2);
    }
    zoomToCover(t2) {
      this.zoomTo("cover", t2);
    }
    zoomToFull(t2) {
      this.zoomTo("full", t2);
    }
    zoomToMax(t2) {
      this.zoomTo("max", t2);
    }
    toggleZoom(t2) {
      this.zoomTo(this.getNextScale("toggleZoom"), t2);
    }
    toggleMax(t2) {
      this.zoomTo(this.getNextScale("toggleMax"), t2);
    }
    toggleCover(t2) {
      this.zoomTo(this.getNextScale("toggleCover"), t2);
    }
    iterateZoom(t2) {
      this.zoomTo("next", t2);
    }
    zoomTo(t2 = 1, { friction: e2 = "auto", originX: i2 = "auto", originY: n2 = "auto", event: s2 } = {}) {
      if (this.isContentLoading || this.state === m.Destroy)
        return;
      const { targetScale: o2, fullScale: a2, maxScale: r2, coverScale: l2 } = this;
      if (this.stop(), this.panMode === O && (s2 = this.pmme || s2), s2 || "auto" === i2 || "auto" === n2) {
        const t3 = this.content.getBoundingClientRect(), e3 = this.container.getBoundingClientRect(), o3 = s2 ? s2.clientX : e3.left + 0.5 * e3.width, a3 = s2 ? s2.clientY : e3.top + 0.5 * e3.height;
        i2 = o3 - t3.left - 0.5 * t3.width, n2 = a3 - t3.top - 0.5 * t3.height;
      }
      let c2 = 1;
      "number" == typeof t2 ? c2 = t2 : "full" === t2 ? c2 = a2 : "cover" === t2 ? c2 = l2 : "max" === t2 ? c2 = r2 : "fit" === t2 ? c2 = 1 : "next" === t2 && (c2 = this.getNextScale("iterateZoom")), c2 = c2 / o2 || 1, e2 = "auto" === e2 ? c2 > 1 ? 0.15 : 0.25 : e2, this.applyChange({ scale: c2, originX: i2, originY: n2, friction: e2 }), s2 && this.panMode === O && this.panWithMouse(s2, e2);
    }
    rotateCCW() {
      this.applyChange({ angle: -90 });
    }
    rotateCW() {
      this.applyChange({ angle: 90 });
    }
    flipX() {
      this.applyChange({ flipX: true });
    }
    flipY() {
      this.applyChange({ flipY: true });
    }
    fitX() {
      this.stop("target");
      const { containerRect: t2, contentRect: e2, target: i2 } = this;
      this.applyChange({ panX: 0.5 * t2.width - (e2.left + 0.5 * e2.fitWidth) - i2.e, panY: 0.5 * t2.height - (e2.top + 0.5 * e2.fitHeight) - i2.f, scale: t2.width / e2.fitWidth / this.targetScale, originX: 0, originY: 0, ignoreBounds: true });
    }
    fitY() {
      this.stop("target");
      const { containerRect: t2, contentRect: e2, target: i2 } = this;
      this.applyChange({ panX: 0.5 * t2.width - (e2.left + 0.5 * e2.fitWidth) - i2.e, panY: 0.5 * t2.innerHeight - (e2.top + 0.5 * e2.fitHeight) - i2.f, scale: t2.height / e2.fitHeight / this.targetScale, originX: 0, originY: 0, ignoreBounds: true });
    }
    toggleFS() {
      const { container: t2 } = this, e2 = this.cn("inFullscreen"), i2 = this.cn("htmlHasFullscreen");
      t2.classList.toggle(e2);
      const n2 = t2.classList.contains(e2);
      n2 ? (document.documentElement.classList.add(i2), document.addEventListener("keydown", this.onKeydown, true)) : (document.documentElement.classList.remove(i2), document.removeEventListener("keydown", this.onKeydown, true)), this.updateMetrics(), this.emit(n2 ? "enterFS" : "exitFS");
    }
    getMatrix(t2 = this.current) {
      const { a: e2, b: i2, c: n2, d: s2, e: o2, f: a2 } = t2;
      return new DOMMatrix([e2, i2, n2, s2, o2, a2]);
    }
    reset(t2) {
      if (this.state !== m.Init && this.state !== m.Destroy) {
        this.stop("current");
        for (const t3 of v)
          this.target[t3] = C[t3];
        this.target.a = this.minScale, this.target.d = this.minScale, this.clampTargetBounds(), this.isResting || (this.friction = void 0 === t2 ? this.option("friction") : t2, this.state = m.Panning, this.requestTick());
      }
    }
    destroy() {
      this.stop(), this.state = m.Destroy, this.detachEvents(), this.detachObserver();
      const { container: t2, content: e2 } = this, i2 = this.option("classes") || {};
      for (const e3 of Object.values(i2))
        t2.classList.remove(e3 + "");
      e2 && (e2.removeEventListener("load", this.onLoad), e2.removeEventListener("error", this.onError)), this.detachPlugins();
    }
  };
  Object.defineProperty(k, "defaults", { enumerable: true, configurable: true, writable: true, value: y }), Object.defineProperty(k, "Plugins", { enumerable: true, configurable: true, writable: true, value: {} });
  var I = function(t2, e2) {
    let i2 = true;
    return (...n2) => {
      i2 && (i2 = false, t2(...n2), setTimeout(() => {
        i2 = true;
      }, e2));
    };
  };
  var D = (t2, e2) => {
    let i2 = [];
    return t2.childNodes.forEach((t3) => {
      t3.nodeType !== Node.ELEMENT_NODE || e2 && !t3.matches(e2) || i2.push(t3);
    }), i2;
  };
  var F = { viewport: null, track: null, enabled: true, slides: [], axis: "x", transition: "fade", preload: 1, slidesPerPage: "auto", initialPage: 0, friction: 0.12, Panzoom: { decelFriction: 0.12 }, center: true, infinite: true, fill: true, dragFree: false, adaptiveHeight: false, direction: "ltr", classes: { container: "f-carousel", viewport: "f-carousel__viewport", track: "f-carousel__track", slide: "f-carousel__slide", isLTR: "is-ltr", isRTL: "is-rtl", isHorizontal: "is-horizontal", isVertical: "is-vertical", inTransition: "in-transition", isSelected: "is-selected" }, l10n: { NEXT: "Next slide", PREV: "Previous slide", GOTO: "Go to slide #%d" } };
  var j;
  !function(t2) {
    t2[t2.Init = 0] = "Init", t2[t2.Ready = 1] = "Ready", t2[t2.Destroy = 2] = "Destroy";
  }(j || (j = {}));
  var B = (t2) => {
    if ("string" == typeof t2 || t2 instanceof HTMLElement)
      t2 = { html: t2 };
    else {
      const e2 = t2.thumb;
      void 0 !== e2 && ("string" == typeof e2 && (t2.thumbSrc = e2), e2 instanceof HTMLImageElement && (t2.thumbEl = e2, t2.thumbElSrc = e2.src, t2.thumbSrc = e2.src), delete t2.thumb);
    }
    return Object.assign({ html: "", el: null, isDom: false, class: "", customClass: "", index: -1, dim: 0, gap: 0, pos: 0, transition: false }, t2);
  };
  var H = (t2 = {}) => Object.assign({ index: -1, slides: [], dim: 0, pos: -1 }, t2);
  var N = class extends f {
    constructor(t2, e2) {
      super(e2), Object.defineProperty(this, "instance", { enumerable: true, configurable: true, writable: true, value: t2 });
    }
    attach() {
    }
    detach() {
    }
  };
  var _ = { classes: { list: "f-carousel__dots", isDynamic: "is-dynamic", hasDots: "has-dots", dot: "f-carousel__dot", isBeforePrev: "is-before-prev", isPrev: "is-prev", isCurrent: "is-current", isNext: "is-next", isAfterNext: "is-after-next" }, dotTpl: '<button type="button" data-carousel-page="%i" aria-label="{{GOTO}}"><span class="f-carousel__dot" aria-hidden="true"></span></button>', dynamicFrom: 11, maxCount: 1 / 0, minCount: 2 };
  var $ = class extends N {
    constructor() {
      super(...arguments), Object.defineProperty(this, "isDynamic", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "list", { enumerable: true, configurable: true, writable: true, value: null });
    }
    onRefresh() {
      this.refresh();
    }
    build() {
      let t2 = this.list;
      if (!t2) {
        t2 = document.createElement("ul"), P(t2, this.cn("list")), t2.setAttribute("role", "tablist");
        const e2 = this.instance.container;
        e2.appendChild(t2), P(e2, this.cn("hasDots")), this.list = t2;
      }
      return t2;
    }
    refresh() {
      var t2;
      const e2 = this.instance.pages.length, i2 = Math.min(2, this.option("minCount")), n2 = Math.max(2e3, this.option("maxCount")), s2 = this.option("dynamicFrom");
      if (e2 < i2 || e2 > n2)
        return void this.cleanup();
      const a2 = "number" == typeof s2 && e2 > 5 && e2 >= s2, r2 = !this.list || this.isDynamic !== a2 || this.list.children.length !== e2;
      r2 && this.cleanup();
      const l2 = this.build();
      if (o(l2, this.cn("isDynamic"), !!a2), r2)
        for (let t3 = 0; t3 < e2; t3++)
          l2.append(this.createItem(t3));
      let c2, h2 = 0;
      for (const e3 of [...l2.children]) {
        const i3 = h2 === this.instance.page;
        i3 && (c2 = e3), o(e3, this.cn("isCurrent"), i3), null === (t2 = e3.children[0]) || void 0 === t2 || t2.setAttribute("aria-selected", i3 ? "true" : "false");
        for (const t3 of ["isBeforePrev", "isPrev", "isNext", "isAfterNext"])
          S(e3, this.cn(t3));
        h2++;
      }
      if (c2 = c2 || l2.firstChild, a2 && c2) {
        const t3 = c2.previousElementSibling, e3 = t3 && t3.previousElementSibling;
        P(t3, this.cn("isPrev")), P(e3, this.cn("isBeforePrev"));
        const i3 = c2.nextElementSibling, n3 = i3 && i3.nextElementSibling;
        P(i3, this.cn("isNext")), P(n3, this.cn("isAfterNext"));
      }
      this.isDynamic = a2;
    }
    createItem(t2 = 0) {
      var e2;
      const i2 = document.createElement("li");
      i2.setAttribute("role", "presentation");
      const s2 = n(this.instance.localize(this.option("dotTpl"), [["%d", t2 + 1]]).replace(/\%i/g, t2 + ""));
      return i2.appendChild(s2), null === (e2 = i2.children[0]) || void 0 === e2 || e2.setAttribute("role", "tab"), i2;
    }
    cleanup() {
      this.list && (this.list.remove(), this.list = null), this.isDynamic = false, S(this.instance.container, this.cn("hasDots"));
    }
    attach() {
      this.instance.on(["refresh", "change"], this.onRefresh);
    }
    detach() {
      this.instance.off(["refresh", "change"], this.onRefresh), this.cleanup();
    }
  };
  Object.defineProperty($, "defaults", { enumerable: true, configurable: true, writable: true, value: _ });
  var W = "disabled";
  var X = "next";
  var q = "prev";
  var Y = class extends N {
    constructor() {
      super(...arguments), Object.defineProperty(this, "container", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "prev", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "next", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "isDom", { enumerable: true, configurable: true, writable: true, value: false });
    }
    onRefresh() {
      const t2 = this.instance, e2 = t2.pages.length, i2 = t2.page;
      if (e2 < 2)
        return void this.cleanup();
      this.build();
      let n2 = this.prev, s2 = this.next;
      n2 && s2 && (n2.removeAttribute(W), s2.removeAttribute(W), t2.isInfinite || (i2 <= 0 && n2.setAttribute(W, ""), i2 >= e2 - 1 && s2.setAttribute(W, "")));
    }
    addBtn(t2) {
      var e2;
      const i2 = this.instance, n2 = document.createElement("button");
      n2.setAttribute("tabindex", "0"), n2.setAttribute("title", i2.localize(`{{${t2.toUpperCase()}}}`)), P(n2, this.cn("button") + " " + this.cn(t2 === X ? "isNext" : "isPrev"));
      const s2 = i2.isRTL ? t2 === X ? q : X : t2;
      var o2;
      return n2.innerHTML = i2.localize(this.option(`${s2}Tpl`)), n2.dataset[`carousel${o2 = t2, o2 ? o2.match("^[a-z]") ? o2.charAt(0).toUpperCase() + o2.substring(1) : o2 : ""}`] = "true", null === (e2 = this.container) || void 0 === e2 || e2.appendChild(n2), n2;
    }
    build() {
      const t2 = this.instance.container, e2 = this.cn("container");
      let { container: i2, prev: n2, next: s2 } = this;
      i2 || (i2 = t2.querySelector("." + e2), this.isDom = !!i2), i2 || (i2 = document.createElement("div"), P(i2, e2), t2.appendChild(i2)), this.container = i2, s2 || (s2 = i2.querySelector("[data-carousel-next]")), s2 || (s2 = this.addBtn(X)), this.next = s2, n2 || (n2 = i2.querySelector("[data-carousel-prev]")), n2 || (n2 = this.addBtn(q)), this.prev = n2;
    }
    cleanup() {
      this.isDom || (this.prev && this.prev.remove(), this.next && this.next.remove(), this.container && this.container.remove()), this.prev = null, this.next = null, this.container = null, this.isDom = false;
    }
    attach() {
      this.instance.on(["refresh", "change"], this.onRefresh);
    }
    detach() {
      this.instance.off(["refresh", "change"], this.onRefresh), this.cleanup();
    }
  };
  Object.defineProperty(Y, "defaults", { enumerable: true, configurable: true, writable: true, value: { classes: { container: "f-carousel__nav", button: "f-button", isNext: "is-next", isPrev: "is-prev" }, nextTpl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M9 3l9 9-9 9"/></svg>', prevTpl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M15 3l-9 9 9 9"/></svg>' } });
  var V = class extends N {
    constructor() {
      super(...arguments), Object.defineProperty(this, "selectedIndex", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "target", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "nav", { enumerable: true, configurable: true, writable: true, value: null });
    }
    addAsTargetFor(t2) {
      this.target = this.instance, this.nav = t2, this.attachEvents();
    }
    addAsNavFor(t2) {
      this.nav = this.instance, this.target = t2, this.attachEvents();
    }
    attachEvents() {
      const { nav: t2, target: e2 } = this;
      t2 && e2 && (t2.options.initialSlide = e2.options.initialPage, t2.state === j.Ready ? this.onNavReady(t2) : t2.on("ready", this.onNavReady), e2.state === j.Ready ? this.onTargetReady(e2) : e2.on("ready", this.onTargetReady));
    }
    onNavReady(t2) {
      t2.on("createSlide", this.onNavCreateSlide), t2.on("Panzoom.click", this.onNavClick), t2.on("Panzoom.touchEnd", this.onNavTouch), this.onTargetChange();
    }
    onTargetReady(t2) {
      t2.on("change", this.onTargetChange), t2.on("Panzoom.refresh", this.onTargetChange), this.onTargetChange();
    }
    onNavClick(t2, e2, i2) {
      this.onNavTouch(t2, t2.panzoom, i2);
    }
    onNavTouch(t2, e2, i2) {
      var n2, s2;
      if (Math.abs(e2.dragOffset.x) > 3 || Math.abs(e2.dragOffset.y) > 3)
        return;
      const o2 = i2.target, { nav: a2, target: r2 } = this;
      if (!a2 || !r2 || !o2)
        return;
      const l2 = o2.closest("[data-index]");
      if (i2.stopPropagation(), i2.preventDefault(), !l2)
        return;
      const c2 = parseInt(l2.dataset.index || "", 10) || 0, h2 = r2.getPageForSlide(c2), d2 = a2.getPageForSlide(c2);
      a2.slideTo(d2), r2.slideTo(h2, { friction: (null === (s2 = null === (n2 = this.nav) || void 0 === n2 ? void 0 : n2.plugins) || void 0 === s2 ? void 0 : s2.Sync.option("friction")) || 0 }), this.markSelectedSlide(c2);
    }
    onNavCreateSlide(t2, e2) {
      e2.index === this.selectedIndex && this.markSelectedSlide(e2.index);
    }
    onTargetChange() {
      var t2, e2;
      const { target: i2, nav: n2 } = this;
      if (!i2 || !n2)
        return;
      if (n2.state !== j.Ready || i2.state !== j.Ready)
        return;
      const s2 = null === (e2 = null === (t2 = i2.pages[i2.page]) || void 0 === t2 ? void 0 : t2.slides[0]) || void 0 === e2 ? void 0 : e2.index, o2 = n2.getPageForSlide(s2);
      this.markSelectedSlide(s2), n2.slideTo(o2, null === n2.prevPage && null === i2.prevPage ? { friction: 0 } : void 0);
    }
    markSelectedSlide(t2) {
      const e2 = this.nav;
      e2 && e2.state === j.Ready && (this.selectedIndex = t2, [...e2.slides].map((e3) => {
        e3.el && e3.el.classList[e3.index === t2 ? "add" : "remove"]("is-nav-selected");
      }));
    }
    attach() {
      const t2 = this;
      let e2 = t2.options.target, i2 = t2.options.nav;
      e2 ? t2.addAsNavFor(e2) : i2 && t2.addAsTargetFor(i2);
    }
    detach() {
      const t2 = this, e2 = t2.nav, i2 = t2.target;
      e2 && (e2.off("ready", t2.onNavReady), e2.off("createSlide", t2.onNavCreateSlide), e2.off("Panzoom.click", t2.onNavClick), e2.off("Panzoom.touchEnd", t2.onNavTouch)), t2.nav = null, i2 && (i2.off("ready", t2.onTargetReady), i2.off("refresh", t2.onTargetChange), i2.off("change", t2.onTargetChange)), t2.target = null;
    }
  };
  Object.defineProperty(V, "defaults", { enumerable: true, configurable: true, writable: true, value: { friction: 0.35 } });
  var Z = { Navigation: Y, Dots: $, Sync: V };
  var U = "animationend";
  var G = "isSelected";
  var K = "slide";
  var J = class _J extends g {
    get axis() {
      return this.isHorizontal ? "e" : "f";
    }
    get isEnabled() {
      return this.state === j.Ready;
    }
    get isInfinite() {
      let t2 = false;
      const { contentDim: e2, viewportDim: i2, pages: n2, slides: s2 } = this, o2 = s2[0];
      return n2.length >= 2 && o2 && e2 + o2.dim >= i2 && (t2 = this.option("infinite")), t2;
    }
    get isRTL() {
      return "rtl" === this.option("direction");
    }
    get isHorizontal() {
      return "x" === this.option("axis");
    }
    constructor(t2, e2 = {}, i2 = {}) {
      if (super(), Object.defineProperty(this, "bp", { enumerable: true, configurable: true, writable: true, value: "" }), Object.defineProperty(this, "lp", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "userOptions", { enumerable: true, configurable: true, writable: true, value: {} }), Object.defineProperty(this, "userPlugins", { enumerable: true, configurable: true, writable: true, value: {} }), Object.defineProperty(this, "state", { enumerable: true, configurable: true, writable: true, value: j.Init }), Object.defineProperty(this, "page", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "prevPage", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "container", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "viewport", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "track", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "slides", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "pages", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "panzoom", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "inTransition", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Set() }), Object.defineProperty(this, "contentDim", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "viewportDim", { enumerable: true, configurable: true, writable: true, value: 0 }), "string" == typeof t2 && (t2 = document.querySelector(t2)), !t2 || !E(t2))
        throw new Error("No Element found");
      this.container = t2, this.slideNext = I(this.slideNext.bind(this), 150), this.slidePrev = I(this.slidePrev.bind(this), 150), this.userOptions = e2, this.userPlugins = i2, queueMicrotask(() => {
        this.processOptions();
      });
    }
    processOptions() {
      var t2, e2;
      const i2 = u({}, _J.defaults, this.userOptions);
      let n2 = "";
      const s2 = i2.breakpoints;
      if (s2 && d(s2))
        for (const [t3, e3] of Object.entries(s2))
          window.matchMedia(t3).matches && d(e3) && (n2 += t3, u(i2, e3));
      n2 === this.bp && this.state !== j.Init || (this.bp = n2, this.state === j.Ready && (i2.initialSlide = (null === (e2 = null === (t2 = this.pages[this.page]) || void 0 === t2 ? void 0 : t2.slides[0]) || void 0 === e2 ? void 0 : e2.index) || 0), this.state !== j.Init && this.destroy(), super.setOptions(i2), false === this.option("enabled") ? this.attachEvents() : setTimeout(() => {
        this.init();
      }, 0));
    }
    init() {
      this.state = j.Init, this.emit("init"), this.attachPlugins(Object.assign(Object.assign({}, _J.Plugins), this.userPlugins)), this.emit("attachPlugins"), this.initLayout(), this.initSlides(), this.updateMetrics(), this.setInitialPosition(), this.initPanzoom(), this.attachEvents(), this.state = j.Ready, this.emit("ready");
    }
    initLayout() {
      const { container: t2 } = this, e2 = this.option("classes");
      P(t2, this.cn("container")), o(t2, e2.isLTR, !this.isRTL), o(t2, e2.isRTL, this.isRTL), o(t2, e2.isVertical, !this.isHorizontal), o(t2, e2.isHorizontal, this.isHorizontal);
      let i2 = this.option("viewport") || t2.querySelector(`.${e2.viewport}`);
      i2 || (i2 = document.createElement("div"), P(i2, e2.viewport), i2.append(...D(t2, `.${e2.slide}`)), t2.prepend(i2)), i2.addEventListener("scroll", this.onScroll);
      let n2 = this.option("track") || t2.querySelector(`.${e2.track}`);
      n2 || (n2 = document.createElement("div"), P(n2, e2.track), n2.append(...Array.from(i2.childNodes))), n2.setAttribute("aria-live", "polite"), i2.contains(n2) || i2.prepend(n2), this.viewport = i2, this.track = n2, this.emit("initLayout");
    }
    initSlides() {
      const { track: t2 } = this;
      if (!t2)
        return;
      const e2 = [...this.slides], i2 = [];
      [...D(t2, `.${this.cn(K)}`)].forEach((t3) => {
        if (E(t3)) {
          const e3 = B({ el: t3, isDom: true, index: this.slides.length });
          i2.push(e3);
        }
      });
      for (let t3 of [...this.option("slides", []) || [], ...e2])
        i2.push(B(t3));
      this.slides = i2;
      for (let t3 = 0; t3 < this.slides.length; t3++)
        this.slides[t3].index = t3;
      for (const t3 of i2)
        this.emit("beforeInitSlide", t3, t3.index), this.emit("initSlide", t3, t3.index);
      this.emit("initSlides");
    }
    setInitialPage() {
      const t2 = this.option("initialSlide");
      this.page = "number" == typeof t2 ? this.getPageForSlide(t2) : parseInt(this.option("initialPage", 0) + "", 10) || 0;
    }
    setInitialPosition() {
      const { track: t2, pages: e2, isHorizontal: i2 } = this;
      if (!t2 || !e2.length)
        return;
      let n2 = this.page;
      e2[n2] || (this.page = n2 = 0);
      const s2 = (e2[n2].pos || 0) * (this.isRTL && i2 ? 1 : -1), o2 = i2 ? `${s2}px` : "0", a2 = i2 ? "0" : `${s2}px`;
      t2.style.transform = `translate3d(${o2}, ${a2}, 0) scale(1)`, this.option("adaptiveHeight") && this.setViewportHeight();
    }
    initPanzoom() {
      this.panzoom && (this.panzoom.destroy(), this.panzoom = null);
      const t2 = this.option("Panzoom") || {};
      this.panzoom = new k(this.viewport, u({}, { content: this.track, zoom: false, panOnlyZoomed: false, lockAxis: this.isHorizontal ? "x" : "y", infinite: this.isInfinite, click: false, dblClick: false, touch: (t3) => !(this.pages.length < 2 && !t3.options.infinite), bounds: () => this.getBounds(), maxVelocity: (t3) => Math.abs(t3.target[this.axis] - t3.current[this.axis]) < 2 * this.viewportDim ? 100 : 0 }, t2)), this.panzoom.on("*", (t3, e2, ...i2) => {
        this.emit(`Panzoom.${e2}`, t3, ...i2);
      }), this.panzoom.on("decel", this.onDecel), this.panzoom.on("refresh", this.onRefresh), this.panzoom.on("beforeTransform", this.onBeforeTransform), this.panzoom.on("endAnimation", this.onEndAnimation);
    }
    attachEvents() {
      const t2 = this.container;
      t2 && (t2.addEventListener("click", this.onClick, { passive: false, capture: false }), t2.addEventListener("slideTo", this.onSlideTo)), window.addEventListener("resize", this.onResize);
    }
    createPages() {
      let t2 = [];
      const { contentDim: e2, viewportDim: i2 } = this;
      let n2 = this.option("slidesPerPage");
      n2 = ("auto" === n2 || e2 <= i2) && false !== this.option("fill") ? 1 / 0 : parseFloat(n2 + "");
      let s2 = 0, o2 = 0, a2 = 0;
      for (const e3 of this.slides)
        (!t2.length || o2 + e3.dim - i2 > 0.05 || a2 >= n2) && (t2.push(H()), s2 = t2.length - 1, o2 = 0, a2 = 0), t2[s2].slides.push(e3), o2 += e3.dim + e3.gap, a2++;
      return t2;
    }
    processPages() {
      const e2 = this.pages, { contentDim: i2, viewportDim: n2, isInfinite: s2 } = this, o2 = this.option("center"), a2 = this.option("fill"), r2 = a2 && o2 && i2 > n2 && !s2;
      if (e2.forEach((t2, e3) => {
        var s3;
        t2.index = e3, t2.pos = (null === (s3 = t2.slides[0]) || void 0 === s3 ? void 0 : s3.pos) || 0, t2.dim = 0;
        for (const [e4, i3] of t2.slides.entries())
          t2.dim += i3.dim, e4 < t2.slides.length - 1 && (t2.dim += i3.gap);
        r2 && t2.pos + 0.5 * t2.dim < 0.5 * n2 ? t2.pos = 0 : r2 && t2.pos + 0.5 * t2.dim >= i2 - 0.5 * n2 ? t2.pos = i2 - n2 : o2 && (t2.pos += -0.5 * (n2 - t2.dim));
      }), e2.forEach((e3) => {
        a2 && !s2 && i2 > n2 && (e3.pos = Math.max(e3.pos, 0), e3.pos = Math.min(e3.pos, i2 - n2)), e3.pos = t(e3.pos, 1e3), e3.dim = t(e3.dim, 1e3), Math.abs(e3.pos) <= 0.1 && (e3.pos = 0);
      }), s2)
        return e2;
      const l2 = [];
      let c2;
      return e2.forEach((t2) => {
        const e3 = Object.assign({}, t2);
        c2 && e3.pos === c2.pos ? (c2.dim += e3.dim, c2.slides = [...c2.slides, ...e3.slides]) : (e3.index = l2.length, c2 = e3, l2.push(e3));
      }), l2;
    }
    getPageFromIndex(t2 = 0) {
      const e2 = this.pages.length;
      let i2;
      return t2 = parseInt((t2 || 0).toString()) || 0, i2 = this.isInfinite ? (t2 % e2 + e2) % e2 : Math.max(Math.min(t2, e2 - 1), 0), i2;
    }
    getSlideMetrics(e2) {
      var i2, n2;
      const s2 = this.isHorizontal ? "width" : "height";
      let o2 = 0, a2 = 0, r2 = e2.el;
      const l2 = !(!r2 || r2.parentNode);
      if (r2 ? o2 = parseFloat(r2.dataset[s2] || "") || 0 : (r2 = document.createElement("div"), r2.style.visibility = "hidden", (this.track || document.body).prepend(r2)), P(r2, this.cn(K) + " " + e2.class + " " + e2.customClass), o2)
        r2.style[s2] = `${o2}px`, r2.style["width" === s2 ? "height" : "width"] = "";
      else {
        l2 && (this.track || document.body).prepend(r2), o2 = r2.getBoundingClientRect()[s2] * Math.max(1, (null === (i2 = window.visualViewport) || void 0 === i2 ? void 0 : i2.scale) || 1);
        let t2 = r2[this.isHorizontal ? "offsetWidth" : "offsetHeight"];
        t2 - 1 > o2 && (o2 = t2);
      }
      const c2 = getComputedStyle(r2);
      return "content-box" === c2.boxSizing && (this.isHorizontal ? (o2 += parseFloat(c2.paddingLeft) || 0, o2 += parseFloat(c2.paddingRight) || 0) : (o2 += parseFloat(c2.paddingTop) || 0, o2 += parseFloat(c2.paddingBottom) || 0)), a2 = parseFloat(c2[this.isHorizontal ? "marginRight" : "marginBottom"]) || 0, l2 ? null === (n2 = r2.parentElement) || void 0 === n2 || n2.removeChild(r2) : e2.el || r2.remove(), { dim: t(o2, 1e3), gap: t(a2, 1e3) };
    }
    getBounds() {
      const { isInfinite: t2, isRTL: e2, isHorizontal: i2, pages: n2 } = this;
      let s2 = { min: 0, max: 0 };
      if (t2)
        s2 = { min: -1 / 0, max: 1 / 0 };
      else if (n2.length) {
        const t3 = n2[0].pos, o2 = n2[n2.length - 1].pos;
        s2 = e2 && i2 ? { min: t3, max: o2 } : { min: -1 * o2, max: -1 * t3 };
      }
      return { x: i2 ? s2 : { min: 0, max: 0 }, y: i2 ? { min: 0, max: 0 } : s2 };
    }
    repositionSlides() {
      let e2, { isHorizontal: i2, isRTL: n2, isInfinite: s2, viewport: o2, viewportDim: a2, contentDim: r2, page: l2, pages: c2, slides: h2, panzoom: d2 } = this, u2 = 0, p2 = 0, f2 = 0, g2 = 0;
      d2 ? g2 = -1 * d2.current[this.axis] : c2[l2] && (g2 = c2[l2].pos || 0), e2 = i2 ? n2 ? "right" : "left" : "top", n2 && i2 && (g2 *= -1);
      for (const i3 of h2) {
        const n3 = i3.el;
        n3 ? ("top" === e2 ? (n3.style.right = "", n3.style.left = "") : n3.style.top = "", i3.index !== u2 ? n3.style[e2] = 0 === p2 ? "" : `${t(p2, 1e3)}px` : n3.style[e2] = "", f2 += i3.dim + i3.gap, u2++) : p2 += i3.dim + i3.gap;
      }
      if (s2 && f2 && o2) {
        let n3 = getComputedStyle(o2), s3 = "padding", l3 = i2 ? "Right" : "Bottom", c3 = parseFloat(n3[s3 + (i2 ? "Left" : "Top")]);
        g2 -= c3, a2 += c3, a2 += parseFloat(n3[s3 + l3]);
        for (const i3 of h2)
          i3.el && (t(i3.pos) < t(a2) && t(i3.pos + i3.dim + i3.gap) < t(g2) && t(g2) > t(r2 - a2) && (i3.el.style[e2] = `${t(p2 + f2, 1e3)}px`), t(i3.pos + i3.gap) >= t(r2 - a2) && t(i3.pos) > t(g2 + a2) && t(g2) < t(a2) && (i3.el.style[e2] = `-${t(f2, 1e3)}px`));
      }
      let m2, v2, b2 = [...this.inTransition];
      if (b2.length > 1 && (m2 = c2[b2[0]], v2 = c2[b2[1]]), m2 && v2) {
        let i3 = 0;
        for (const n3 of h2)
          n3.el ? this.inTransition.has(n3.index) && m2.slides.indexOf(n3) < 0 && (n3.el.style[e2] = `${t(i3 + (m2.pos - v2.pos), 1e3)}px`) : i3 += n3.dim + n3.gap;
      }
    }
    createSlideEl(t2) {
      const { track: e2, slides: i2 } = this;
      if (!e2 || !t2)
        return;
      if (t2.el && t2.el.parentNode)
        return;
      const n2 = t2.el || document.createElement("div");
      P(n2, this.cn(K)), P(n2, t2.class), P(n2, t2.customClass);
      const s2 = t2.html;
      s2 && (s2 instanceof HTMLElement ? n2.appendChild(s2) : n2.innerHTML = t2.html + "");
      const o2 = [];
      i2.forEach((t3, e3) => {
        t3.el && o2.push(e3);
      });
      const a2 = t2.index;
      let r2 = null;
      if (o2.length) {
        r2 = i2[o2.reduce((t3, e3) => Math.abs(e3 - a2) < Math.abs(t3 - a2) ? e3 : t3)];
      }
      const l2 = r2 && r2.el && r2.el.parentNode ? r2.index < t2.index ? r2.el.nextSibling : r2.el : null;
      e2.insertBefore(n2, e2.contains(l2) ? l2 : null), t2.el = n2, this.emit("createSlide", t2);
    }
    removeSlideEl(t2, e2 = false) {
      const i2 = null == t2 ? void 0 : t2.el;
      if (!i2 || !i2.parentNode)
        return;
      const n2 = this.cn(G);
      if (i2.classList.contains(n2) && (S(i2, n2), this.emit("unselectSlide", t2)), t2.isDom && !e2)
        return i2.removeAttribute("aria-hidden"), i2.removeAttribute("data-index"), void (i2.style.left = "");
      this.emit("removeSlide", t2);
      const s2 = new CustomEvent(U);
      i2.dispatchEvent(s2), t2.el && (t2.el.remove(), t2.el = null);
    }
    transitionTo(t2 = 0, e2 = this.option("transition")) {
      var i2, n2, s2, o2;
      if (!e2)
        return false;
      const a2 = this.page, { pages: r2, panzoom: l2 } = this;
      t2 = parseInt((t2 || 0).toString()) || 0;
      const c2 = this.getPageFromIndex(t2);
      if (!l2 || !r2[c2] || r2.length < 2 || Math.abs(((null === (n2 = null === (i2 = r2[a2]) || void 0 === i2 ? void 0 : i2.slides[0]) || void 0 === n2 ? void 0 : n2.dim) || 0) - this.viewportDim) > 1)
        return false;
      const h2 = t2 > a2 ? 1 : -1, d2 = r2[c2].pos * (this.isRTL ? 1 : -1);
      if (a2 === c2 && Math.abs(d2 - l2.target[this.axis]) < 1)
        return false;
      this.clearTransitions();
      const u2 = l2.isResting;
      P(this.container, this.cn("inTransition"));
      const p2 = (null === (s2 = r2[a2]) || void 0 === s2 ? void 0 : s2.slides[0]) || null, f2 = (null === (o2 = r2[c2]) || void 0 === o2 ? void 0 : o2.slides[0]) || null;
      this.inTransition.add(f2.index), this.createSlideEl(f2);
      let g2 = p2.el, m2 = f2.el;
      u2 || e2 === K || (e2 = "fadeFast", g2 = null);
      const v2 = this.isRTL ? "next" : "prev", b2 = this.isRTL ? "prev" : "next";
      return g2 && (this.inTransition.add(p2.index), p2.transition = e2, g2.addEventListener(U, this.onAnimationEnd), g2.classList.add(`f-${e2}Out`, `to-${h2 > 0 ? b2 : v2}`)), m2 && (f2.transition = e2, m2.addEventListener(U, this.onAnimationEnd), m2.classList.add(`f-${e2}In`, `from-${h2 > 0 ? v2 : b2}`)), l2.current[this.axis] = d2, l2.target[this.axis] = d2, l2.requestTick(), this.onChange(c2), true;
    }
    manageSlideVisiblity() {
      const t2 = /* @__PURE__ */ new Set(), e2 = /* @__PURE__ */ new Set(), i2 = this.getVisibleSlides(parseFloat(this.option("preload", 0) + "") || 0);
      for (const n2 of this.slides)
        i2.has(n2) ? t2.add(n2) : e2.add(n2);
      for (const e3 of this.inTransition)
        t2.add(this.slides[e3]);
      for (const e3 of t2)
        this.createSlideEl(e3), this.lazyLoadSlide(e3);
      for (const i3 of e2)
        t2.has(i3) || this.removeSlideEl(i3);
      this.markSelectedSlides(), this.repositionSlides();
    }
    markSelectedSlides() {
      if (!this.pages[this.page] || !this.pages[this.page].slides)
        return;
      const t2 = "aria-hidden";
      let e2 = this.cn(G);
      if (e2)
        for (const i2 of this.slides) {
          const n2 = i2.el;
          n2 && (n2.dataset.index = `${i2.index}`, n2.classList.contains("f-thumbs__slide") ? this.getVisibleSlides(0).has(i2) ? n2.removeAttribute(t2) : n2.setAttribute(t2, "true") : this.pages[this.page].slides.includes(i2) ? (n2.classList.contains(e2) || (P(n2, e2), this.emit("selectSlide", i2)), n2.removeAttribute(t2)) : (n2.classList.contains(e2) && (S(n2, e2), this.emit("unselectSlide", i2)), n2.setAttribute(t2, "true")));
        }
    }
    flipInfiniteTrack() {
      const { axis: t2, isHorizontal: e2, isInfinite: i2, isRTL: n2, viewportDim: s2, contentDim: o2 } = this, a2 = this.panzoom;
      if (!a2 || !i2)
        return;
      let r2 = a2.current[t2], l2 = a2.target[t2] - r2, c2 = 0, h2 = 0.5 * s2;
      n2 && e2 ? (r2 < -h2 && (c2 = -1, r2 += o2), r2 > o2 - h2 && (c2 = 1, r2 -= o2)) : (r2 > h2 && (c2 = 1, r2 -= o2), r2 < -o2 + h2 && (c2 = -1, r2 += o2)), c2 && (a2.current[t2] = r2, a2.target[t2] = r2 + l2);
    }
    lazyLoadImg(t2, e2) {
      const i2 = this, s2 = "f-fadeIn", o2 = "is-preloading";
      let a2 = false, r2 = null;
      const l2 = () => {
        a2 || (a2 = true, r2 && (r2.remove(), r2 = null), S(e2, o2), e2.complete && (P(e2, s2), setTimeout(() => {
          S(e2, s2);
        }, 350)), this.option("adaptiveHeight") && t2.el && this.pages[this.page].slides.indexOf(t2) > -1 && (i2.updateMetrics(), i2.setViewportHeight()), this.emit("load", t2));
      };
      P(e2, o2), e2.src = e2.dataset.lazySrcset || e2.dataset.lazySrc || "", delete e2.dataset.lazySrc, delete e2.dataset.lazySrcset, e2.addEventListener("error", () => {
        l2();
      }), e2.addEventListener("load", () => {
        l2();
      }), setTimeout(() => {
        const i3 = e2.parentNode;
        i3 && t2.el && (e2.complete ? l2() : a2 || (r2 = n(x), i3.insertBefore(r2, e2)));
      }, 300);
    }
    lazyLoadSlide(t2) {
      const e2 = t2 && t2.el;
      if (!e2)
        return;
      const i2 = /* @__PURE__ */ new Set();
      let n2 = Array.from(e2.querySelectorAll("[data-lazy-src],[data-lazy-srcset]"));
      e2.dataset.lazySrc && n2.push(e2), n2.map((t3) => {
        t3 instanceof HTMLImageElement ? i2.add(t3) : t3 instanceof HTMLElement && t3.dataset.lazySrc && (t3.style.backgroundImage = `url('${t3.dataset.lazySrc}')`, delete t3.dataset.lazySrc);
      });
      for (const e3 of i2)
        this.lazyLoadImg(t2, e3);
    }
    onAnimationEnd(t2) {
      var e2;
      const i2 = t2.target, n2 = i2 ? parseInt(i2.dataset.index || "", 10) || 0 : -1, s2 = this.slides[n2], o2 = t2.animationName;
      if (!i2 || !s2 || !o2)
        return;
      const a2 = !!this.inTransition.has(n2) && s2.transition;
      a2 && o2.substring(0, a2.length + 2) === `f-${a2}` && this.inTransition.delete(n2), this.inTransition.size || this.clearTransitions(), n2 === this.page && (null === (e2 = this.panzoom) || void 0 === e2 ? void 0 : e2.isResting) && this.emit("settle");
    }
    onDecel(t2, e2 = 0, i2 = 0, n2 = 0, s2 = 0) {
      if (this.option("dragFree"))
        return void this.setPageFromPosition();
      const { isRTL: o2, isHorizontal: a2, axis: r2, pages: l2 } = this, c2 = l2.length, h2 = Math.abs(Math.atan2(i2, e2) / (Math.PI / 180));
      let d2 = 0;
      if (d2 = h2 > 45 && h2 < 135 ? a2 ? 0 : i2 : a2 ? e2 : 0, !c2)
        return;
      let u2 = this.page, p2 = o2 && a2 ? 1 : -1;
      const f2 = t2.current[r2] * p2;
      let { pageIndex: g2 } = this.getPageFromPosition(f2);
      Math.abs(d2) > 5 ? (l2[u2].dim < document.documentElement["client" + (this.isHorizontal ? "Width" : "Height")] - 1 && (u2 = g2), u2 = o2 && a2 ? d2 < 0 ? u2 - 1 : u2 + 1 : d2 < 0 ? u2 + 1 : u2 - 1) : u2 = 0 === n2 && 0 === s2 ? u2 : g2, this.slideTo(u2, { transition: false, friction: t2.option("decelFriction") });
    }
    onClick(t2) {
      const e2 = t2.target, i2 = e2 && E(e2) ? e2.dataset : null;
      let n2, s2;
      i2 && (void 0 !== i2.carouselPage ? (s2 = "slideTo", n2 = i2.carouselPage) : void 0 !== i2.carouselNext ? s2 = "slideNext" : void 0 !== i2.carouselPrev && (s2 = "slidePrev")), s2 ? (t2.preventDefault(), t2.stopPropagation(), e2 && !e2.hasAttribute("disabled") && this[s2](n2)) : this.emit("click", t2);
    }
    onSlideTo(t2) {
      const e2 = t2.detail || 0;
      this.slideTo(this.getPageForSlide(e2), { friction: 0 });
    }
    onChange(t2, e2 = 0) {
      const i2 = this.page;
      this.prevPage = i2, this.page = t2, this.option("adaptiveHeight") && this.setViewportHeight(), t2 !== i2 && (this.markSelectedSlides(), this.emit("change", t2, i2, e2));
    }
    onRefresh() {
      let t2 = this.contentDim, e2 = this.viewportDim;
      this.updateMetrics(), this.contentDim === t2 && this.viewportDim === e2 || this.slideTo(this.page, { friction: 0, transition: false });
    }
    onScroll() {
      var t2;
      null === (t2 = this.viewport) || void 0 === t2 || t2.scroll(0, 0);
    }
    onResize() {
      this.option("breakpoints") && this.processOptions();
    }
    onBeforeTransform(t2) {
      this.lp !== t2.current[this.axis] && (this.flipInfiniteTrack(), this.manageSlideVisiblity()), this.lp = t2.current.e;
    }
    onEndAnimation() {
      this.inTransition.size || this.emit("settle");
    }
    reInit(t2 = null, e2 = null) {
      this.destroy(), this.state = j.Init, this.prevPage = null, this.userOptions = t2 || this.userOptions, this.userPlugins = e2 || this.userPlugins, this.processOptions();
    }
    slideTo(t2 = 0, { friction: e2 = this.option("friction"), transition: i2 = this.option("transition") } = {}) {
      if (this.state === j.Destroy)
        return;
      t2 = parseInt((t2 || 0).toString()) || 0;
      const n2 = this.getPageFromIndex(t2), { axis: s2, isHorizontal: o2, isRTL: a2, pages: r2, panzoom: l2 } = this, c2 = r2.length, h2 = a2 && o2 ? 1 : -1;
      if (!l2 || !c2)
        return;
      if (this.page !== n2) {
        const e3 = new Event("beforeChange", { bubbles: true, cancelable: true });
        if (this.emit("beforeChange", e3, t2), e3.defaultPrevented)
          return;
      }
      if (this.transitionTo(t2, i2))
        return;
      let d2 = r2[n2].pos;
      if (this.isInfinite) {
        const e3 = this.contentDim, i3 = l2.target[s2] * h2;
        if (2 === c2)
          d2 += e3 * Math.floor(parseFloat(t2 + "") / 2);
        else {
          d2 = [d2, d2 - e3, d2 + e3].reduce(function(t3, e4) {
            return Math.abs(e4 - i3) < Math.abs(t3 - i3) ? e4 : t3;
          });
        }
      }
      d2 *= h2, Math.abs(l2.target[s2] - d2) < 1 || (l2.panTo({ x: o2 ? d2 : 0, y: o2 ? 0 : d2, friction: e2 }), this.onChange(n2));
    }
    slideToClosest(t2) {
      if (this.panzoom) {
        const { pageIndex: e2 } = this.getPageFromPosition();
        this.slideTo(e2, t2);
      }
    }
    slideNext() {
      this.slideTo(this.page + 1);
    }
    slidePrev() {
      this.slideTo(this.page - 1);
    }
    clearTransitions() {
      this.inTransition.clear(), S(this.container, this.cn("inTransition"));
      const t2 = ["to-prev", "to-next", "from-prev", "from-next"];
      for (const e2 of this.slides) {
        const i2 = e2.el;
        if (i2) {
          i2.removeEventListener(U, this.onAnimationEnd), i2.classList.remove(...t2);
          const n2 = e2.transition;
          n2 && i2.classList.remove(`f-${n2}Out`, `f-${n2}In`);
        }
      }
      this.manageSlideVisiblity();
    }
    addSlide(t2, e2) {
      var i2, n2, s2, o2;
      const a2 = this.panzoom, r2 = (null === (i2 = this.pages[this.page]) || void 0 === i2 ? void 0 : i2.pos) || 0, l2 = (null === (n2 = this.pages[this.page]) || void 0 === n2 ? void 0 : n2.dim) || 0, c2 = this.contentDim < this.viewportDim;
      let h2 = Array.isArray(e2) ? e2 : [e2];
      const d2 = [];
      for (const t3 of h2)
        d2.push(B(t3));
      this.slides.splice(t2, 0, ...d2);
      for (let t3 = 0; t3 < this.slides.length; t3++)
        this.slides[t3].index = t3;
      for (const t3 of d2)
        this.emit("beforeInitSlide", t3, t3.index);
      if (this.page >= t2 && (this.page += d2.length), this.updateMetrics(), a2) {
        const e3 = (null === (s2 = this.pages[this.page]) || void 0 === s2 ? void 0 : s2.pos) || 0, i3 = (null === (o2 = this.pages[this.page]) || void 0 === o2 ? void 0 : o2.dim) || 0, n3 = this.pages.length || 1, h3 = this.isRTL ? l2 - i3 : i3 - l2, d3 = this.isRTL ? r2 - e3 : e3 - r2;
        c2 && 1 === n3 ? (t2 <= this.page && (a2.current[this.axis] -= h3, a2.target[this.axis] -= h3), a2.panTo({ [this.isHorizontal ? "x" : "y"]: -1 * e3 })) : d3 && t2 <= this.page && (a2.target[this.axis] -= d3, a2.current[this.axis] -= d3, a2.requestTick());
      }
      for (const t3 of d2)
        this.emit("initSlide", t3, t3.index);
    }
    prependSlide(t2) {
      this.addSlide(0, t2);
    }
    appendSlide(t2) {
      this.addSlide(this.slides.length, t2);
    }
    removeSlide(t2) {
      const e2 = this.slides.length;
      t2 = (t2 % e2 + e2) % e2;
      const i2 = this.slides[t2];
      if (i2) {
        this.removeSlideEl(i2, true), this.slides.splice(t2, 1);
        for (let t3 = 0; t3 < this.slides.length; t3++)
          this.slides[t3].index = t3;
        this.updateMetrics(), this.slideTo(this.page, { friction: 0, transition: false }), this.emit("destroySlide", i2);
      }
    }
    updateMetrics() {
      const { panzoom: e2, viewport: i2, track: n2, slides: s2, isHorizontal: o2, isInfinite: a2 } = this;
      if (!n2)
        return;
      const r2 = o2 ? "width" : "height", l2 = o2 ? "offsetWidth" : "offsetHeight";
      if (i2) {
        let e3 = Math.max(i2[l2], t(i2.getBoundingClientRect()[r2], 1e3)), n3 = getComputedStyle(i2), s3 = "padding", a3 = o2 ? "Right" : "Bottom";
        e3 -= parseFloat(n3[s3 + (o2 ? "Left" : "Top")]) + parseFloat(n3[s3 + a3]), this.viewportDim = e3;
      }
      let c2, h2 = 0;
      for (const [e3, i3] of s2.entries()) {
        let n3 = 0, o3 = 0;
        !i3.el && c2 ? (n3 = c2.dim, o3 = c2.gap) : ({ dim: n3, gap: o3 } = this.getSlideMetrics(i3), c2 = i3), n3 = t(n3, 1e3), o3 = t(o3, 1e3), i3.dim = n3, i3.gap = o3, i3.pos = h2, h2 += n3, (a2 || e3 < s2.length - 1) && (h2 += o3);
      }
      h2 = t(h2, 1e3), this.contentDim = h2, e2 && (e2.contentRect[r2] = h2, e2.contentRect[o2 ? "fullWidth" : "fullHeight"] = h2), this.pages = this.createPages(), this.pages = this.processPages(), this.state === j.Init && this.setInitialPage(), this.page = Math.max(0, Math.min(this.page, this.pages.length - 1)), this.manageSlideVisiblity(), this.emit("refresh");
    }
    getProgress(e2, i2 = false, n2 = false) {
      void 0 === e2 && (e2 = this.page);
      const s2 = this, o2 = s2.panzoom, a2 = s2.contentDim, r2 = s2.pages[e2] || 0;
      if (!r2 || !o2)
        return e2 > this.page ? -1 : 1;
      let l2 = -1 * o2.current.e, c2 = t((l2 - r2.pos) / (1 * r2.dim), 1e3), h2 = c2, d2 = c2;
      this.isInfinite && true !== n2 && (h2 = t((l2 - r2.pos + a2) / (1 * r2.dim), 1e3), d2 = t((l2 - r2.pos - a2) / (1 * r2.dim), 1e3));
      let u2 = [c2, h2, d2].reduce(function(t2, e3) {
        return Math.abs(e3) < Math.abs(t2) ? e3 : t2;
      });
      return i2 ? u2 : u2 > 1 ? 1 : u2 < -1 ? -1 : u2;
    }
    setViewportHeight() {
      const { page: t2, pages: e2, viewport: i2, isHorizontal: n2 } = this;
      if (!i2 || !e2[t2])
        return;
      let s2 = 0;
      n2 && this.track && (this.track.style.height = "auto", e2[t2].slides.forEach((t3) => {
        t3.el && (s2 = Math.max(s2, t3.el.offsetHeight));
      })), i2.style.height = s2 ? `${s2}px` : "";
    }
    getPageForSlide(t2) {
      for (const e2 of this.pages)
        for (const i2 of e2.slides)
          if (i2.index === t2)
            return e2.index;
      return -1;
    }
    getVisibleSlides(t2 = 0) {
      var e2;
      const i2 = /* @__PURE__ */ new Set();
      let { panzoom: n2, contentDim: s2, viewportDim: o2, pages: a2, page: r2 } = this;
      if (o2) {
        s2 = s2 + (null === (e2 = this.slides[this.slides.length - 1]) || void 0 === e2 ? void 0 : e2.gap) || 0;
        let l2 = 0;
        l2 = n2 && n2.state !== m.Init && n2.state !== m.Destroy ? -1 * n2.current[this.axis] : a2[r2] && a2[r2].pos || 0, this.isInfinite && (l2 -= Math.floor(l2 / s2) * s2), this.isRTL && this.isHorizontal && (l2 *= -1);
        const c2 = l2 - o2 * t2, h2 = l2 + o2 * (t2 + 1), d2 = this.isInfinite ? [-1, 0, 1] : [0];
        for (const t3 of this.slides)
          for (const e3 of d2) {
            const n3 = t3.pos + e3 * s2, o3 = n3 + t3.dim + t3.gap;
            n3 < h2 && o3 > c2 && i2.add(t3);
          }
      }
      return i2;
    }
    getPageFromPosition(t2) {
      const { viewportDim: e2, contentDim: i2, slides: n2, pages: s2, panzoom: o2 } = this, a2 = s2.length, r2 = n2.length, l2 = n2[0], c2 = n2[r2 - 1], h2 = this.option("center");
      let d2 = 0, u2 = 0, p2 = 0, f2 = void 0 === t2 ? -1 * ((null == o2 ? void 0 : o2.target[this.axis]) || 0) : t2;
      h2 && (f2 += 0.5 * e2), this.isInfinite ? (f2 < l2.pos - 0.5 * c2.gap && (f2 -= i2, p2 = -1), f2 > c2.pos + c2.dim + 0.5 * c2.gap && (f2 -= i2, p2 = 1)) : f2 = Math.max(l2.pos || 0, Math.min(f2, c2.pos));
      let g2 = c2, m2 = n2.find((t3) => {
        const e3 = t3.pos - 0.5 * g2.gap, i3 = t3.pos + t3.dim + 0.5 * t3.gap;
        return g2 = t3, f2 >= e3 && f2 < i3;
      });
      return m2 || (m2 = c2), u2 = this.getPageForSlide(m2.index), d2 = u2 + p2 * a2, { page: d2, pageIndex: u2 };
    }
    setPageFromPosition() {
      const { pageIndex: t2 } = this.getPageFromPosition();
      this.onChange(t2);
    }
    destroy() {
      if ([j.Destroy].includes(this.state))
        return;
      this.state = j.Destroy;
      const { container: t2, viewport: e2, track: i2, slides: n2, panzoom: s2 } = this, o2 = this.option("classes");
      t2.removeEventListener("click", this.onClick, { passive: false, capture: false }), t2.removeEventListener("slideTo", this.onSlideTo), window.removeEventListener("resize", this.onResize), s2 && (s2.destroy(), this.panzoom = null), n2 && n2.forEach((t3) => {
        this.removeSlideEl(t3);
      }), this.detachPlugins(), e2 && (e2.removeEventListener("scroll", this.onScroll), e2.offsetParent && i2 && i2.offsetParent && e2.replaceWith(...i2.childNodes));
      for (const [e3, i3] of Object.entries(o2))
        "container" !== e3 && i3 && t2.classList.remove(i3);
      this.track = null, this.viewport = null, this.page = 0, this.slides = [];
      const a2 = this.events.get("ready");
      this.events = /* @__PURE__ */ new Map(), a2 && this.events.set("ready", a2);
    }
  };
  Object.defineProperty(J, "Panzoom", { enumerable: true, configurable: true, writable: true, value: k }), Object.defineProperty(J, "defaults", { enumerable: true, configurable: true, writable: true, value: F }), Object.defineProperty(J, "Plugins", { enumerable: true, configurable: true, writable: true, value: Z });
  var Q = function(t2) {
    if (!E(t2))
      return 0;
    const e2 = window.scrollY, i2 = window.innerHeight, n2 = e2 + i2, s2 = t2.getBoundingClientRect(), o2 = s2.y + e2, a2 = s2.height, r2 = o2 + a2;
    if (e2 > r2 || n2 < o2)
      return 0;
    if (e2 < o2 && n2 > r2)
      return 100;
    if (o2 < e2 && r2 > n2)
      return 100;
    let l2 = a2;
    o2 < e2 && (l2 -= e2 - o2), r2 > n2 && (l2 -= r2 - n2);
    const c2 = l2 / i2 * 100;
    return Math.round(c2);
  };
  var tt = !("undefined" == typeof window || !window.document || !window.document.createElement);
  var et;
  var it = ["a[href]", "area[href]", 'input:not([disabled]):not([type="hidden"]):not([aria-hidden])', "select:not([disabled]):not([aria-hidden])", "textarea:not([disabled]):not([aria-hidden])", "button:not([disabled]):not([aria-hidden]):not(.fancybox-focus-guard)", "iframe", "object", "embed", "video", "audio", "[contenteditable]", '[tabindex]:not([tabindex^="-"]):not([disabled]):not([aria-hidden])'].join(",");
  var nt = (t2) => {
    if (t2 && tt) {
      void 0 === et && document.createElement("div").focus({ get preventScroll() {
        return et = true, false;
      } });
      try {
        if (et)
          t2.focus({ preventScroll: true });
        else {
          const e2 = window.scrollY || document.body.scrollTop, i2 = window.scrollX || document.body.scrollLeft;
          t2.focus(), document.body.scrollTo({ top: e2, left: i2, behavior: "auto" });
        }
      } catch (t3) {
      }
    }
  };
  var st = () => {
    const t2 = document;
    let e2, i2 = "", n2 = "", s2 = "";
    return t2.fullscreenEnabled ? (i2 = "requestFullscreen", n2 = "exitFullscreen", s2 = "fullscreenElement") : t2.webkitFullscreenEnabled && (i2 = "webkitRequestFullscreen", n2 = "webkitExitFullscreen", s2 = "webkitFullscreenElement"), i2 && (e2 = { request: function(e3 = t2.documentElement) {
      return "webkitRequestFullscreen" === i2 ? e3[i2](Element.ALLOW_KEYBOARD_INPUT) : e3[i2]();
    }, exit: function() {
      return t2[s2] && t2[n2]();
    }, isFullscreen: function() {
      return t2[s2];
    } }), e2;
  };
  var ot = { dragToClose: true, hideScrollbar: true, Carousel: { classes: { container: "fancybox__carousel", viewport: "fancybox__viewport", track: "fancybox__track", slide: "fancybox__slide" } }, contentClick: "toggleZoom", contentDblClick: false, backdropClick: "close", animated: true, idle: 3500, showClass: "f-zoomInUp", hideClass: "f-fadeOut", commonCaption: false, parentEl: null, startIndex: 0, l10n: Object.assign(Object.assign({}, b), { CLOSE: "Close", NEXT: "Next", PREV: "Previous", MODAL: "You can close this modal content with the ESC key", ERROR: "Something Went Wrong, Please Try Again Later", IMAGE_ERROR: "Image Not Found", ELEMENT_NOT_FOUND: "HTML Element Not Found", AJAX_NOT_FOUND: "Error Loading AJAX : Not Found", AJAX_FORBIDDEN: "Error Loading AJAX : Forbidden", IFRAME_ERROR: "Error Loading Page", TOGGLE_ZOOM: "Toggle zoom level", TOGGLE_THUMBS: "Toggle thumbnails", TOGGLE_SLIDESHOW: "Toggle slideshow", TOGGLE_FULLSCREEN: "Toggle full-screen mode", DOWNLOAD: "Download" }), tpl: { closeButton: '<button data-fancybox-close class="f-button is-close-btn" title="{{CLOSE}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M20 20L4 4m16 0L4 20"/></svg></button>', main: '<div class="fancybox__container" role="dialog" aria-modal="true" aria-label="{{MODAL}}" tabindex="-1">\n    <div class="fancybox__backdrop"></div>\n    <div class="fancybox__carousel"></div>\n    <div class="fancybox__footer"></div>\n  </div>' }, groupAll: false, groupAttr: "data-fancybox", defaultType: "image", defaultDisplay: "block", autoFocus: true, trapFocus: true, placeFocusBack: true, closeButton: "auto", keyboard: { Escape: "close", Delete: "close", Backspace: "close", PageUp: "next", PageDown: "prev", ArrowUp: "prev", ArrowDown: "next", ArrowRight: "next", ArrowLeft: "prev" }, Fullscreen: { autoStart: false }, compact: () => window.matchMedia("(max-width: 578px), (max-height: 578px)").matches, wheel: "zoom" };
  var at;
  var rt;
  !function(t2) {
    t2[t2.Init = 0] = "Init", t2[t2.Ready = 1] = "Ready", t2[t2.Closing = 2] = "Closing", t2[t2.CustomClosing = 3] = "CustomClosing", t2[t2.Destroy = 4] = "Destroy";
  }(at || (at = {})), function(t2) {
    t2[t2.Loading = 0] = "Loading", t2[t2.Opening = 1] = "Opening", t2[t2.Ready = 2] = "Ready", t2[t2.Closing = 3] = "Closing";
  }(rt || (rt = {}));
  var lt = "";
  var ct = false;
  var ht = false;
  var dt = null;
  var ut = () => {
    let t2 = "", e2 = "";
    const i2 = Ce.getInstance();
    if (i2) {
      const n2 = i2.carousel, s2 = i2.getSlide();
      if (n2 && s2) {
        let o2 = s2.slug || void 0, a2 = s2.triggerEl || void 0;
        e2 = o2 || (i2.option("slug") || ""), !e2 && a2 && a2.dataset && (e2 = a2.dataset.fancybox || ""), e2 && "true" !== e2 && (t2 = "#" + e2 + (!o2 && n2.slides.length > 1 ? "-" + (s2.index + 1) : ""));
      }
    }
    return { hash: t2, slug: e2, index: 1 };
  };
  var pt = () => {
    const t2 = new URL(document.URL).hash, e2 = t2.slice(1).split("-"), i2 = e2[e2.length - 1], n2 = i2 && /^\+?\d+$/.test(i2) && parseInt(e2.pop() || "1", 10) || 1;
    return { hash: t2, slug: e2.join("-"), index: n2 };
  };
  var ft = () => {
    const { slug: t2, index: e2 } = pt();
    if (!t2)
      return;
    let i2 = document.querySelector(`[data-slug="${t2}"]`);
    if (i2 && i2.dispatchEvent(new CustomEvent("click", { bubbles: true, cancelable: true })), Ce.getInstance())
      return;
    const n2 = document.querySelectorAll(`[data-fancybox="${t2}"]`);
    n2.length && (i2 = n2[e2 - 1], i2 && i2.dispatchEvent(new CustomEvent("click", { bubbles: true, cancelable: true })));
  };
  var gt = () => {
    if (false === Ce.defaults.Hash)
      return;
    const t2 = Ce.getInstance();
    if (false === (null == t2 ? void 0 : t2.options.Hash))
      return;
    const { slug: e2, index: i2 } = pt(), { slug: n2 } = ut();
    t2 && (e2 === n2 ? t2.jumpTo(i2 - 1) : (ct = true, t2.close())), ft();
  };
  var mt = () => {
    dt && clearTimeout(dt), queueMicrotask(() => {
      gt();
    });
  };
  var vt = () => {
    window.addEventListener("hashchange", mt, false), setTimeout(() => {
      gt();
    }, 500);
  };
  tt && (/complete|interactive|loaded/.test(document.readyState) ? vt() : document.addEventListener("DOMContentLoaded", vt));
  var bt = "is-zooming-in";
  var yt = class extends N {
    onCreateSlide(t2, e2, i2) {
      const n2 = this.instance.optionFor(i2, "src") || "";
      i2.el && "image" === i2.type && "string" == typeof n2 && this.setImage(i2, n2);
    }
    onRemoveSlide(t2, e2, i2) {
      i2.panzoom && i2.panzoom.destroy(), i2.panzoom = void 0, i2.imageEl = void 0;
    }
    onChange(t2, e2, i2, n2) {
      S(this.instance.container, bt);
      for (const t3 of e2.slides) {
        const e3 = t3.panzoom;
        e3 && t3.index !== i2 && e3.reset(0.35);
      }
    }
    onClose() {
      var t2;
      const e2 = this.instance, i2 = e2.container, n2 = e2.getSlide();
      if (!i2 || !i2.parentElement || !n2)
        return;
      const { el: s2, contentEl: o2, panzoom: a2, thumbElSrc: r2 } = n2;
      if (!s2 || !r2 || !o2 || !a2 || a2.isContentLoading || a2.state === m.Init || a2.state === m.Destroy)
        return;
      a2.updateMetrics();
      let l2 = this.getZoomInfo(n2);
      if (!l2)
        return;
      this.instance.state = at.CustomClosing, i2.classList.remove(bt), i2.classList.add("is-zooming-out"), o2.style.backgroundImage = `url('${r2}')`;
      const c2 = i2.getBoundingClientRect();
      1 === ((null === (t2 = window.visualViewport) || void 0 === t2 ? void 0 : t2.scale) || 1) && Object.assign(i2.style, { position: "absolute", top: `${i2.offsetTop + window.scrollY}px`, left: `${i2.offsetLeft + window.scrollX}px`, bottom: "auto", right: "auto", width: `${c2.width}px`, height: `${c2.height}px`, overflow: "hidden" });
      const { x: h2, y: d2, scale: u2, opacity: p2 } = l2;
      if (p2) {
        const t3 = ((t4, e3, i3, n3) => {
          const s3 = e3 - t4, o3 = n3 - i3;
          return (e4) => i3 + ((e4 - t4) / s3 * o3 || 0);
        })(a2.scale, u2, 1, 0);
        a2.on("afterTransform", () => {
          o2.style.opacity = t3(a2.scale) + "";
        });
      }
      a2.on("endAnimation", () => {
        e2.destroy();
      }), a2.target.a = u2, a2.target.b = 0, a2.target.c = 0, a2.target.d = u2, a2.panTo({ x: h2, y: d2, scale: u2, friction: p2 ? 0.2 : 0.33, ignoreBounds: true }), a2.isResting && e2.destroy();
    }
    setImage(t2, e2) {
      const i2 = this.instance;
      t2.src = e2, this.process(t2, e2).then((e3) => {
        const { contentEl: n2, imageEl: s2, thumbElSrc: o2, el: a2 } = t2;
        if (i2.isClosing() || !n2 || !s2)
          return;
        n2.offsetHeight;
        const r2 = !!i2.isOpeningSlide(t2) && this.getZoomInfo(t2);
        if (this.option("protected") && a2) {
          a2.addEventListener("contextmenu", (t4) => {
            t4.preventDefault();
          });
          const t3 = document.createElement("div");
          P(t3, "fancybox-protected"), n2.appendChild(t3);
        }
        if (o2 && r2) {
          const s3 = e3.contentRect, a3 = Math.max(s3.fullWidth, s3.fullHeight);
          let c2 = null;
          !r2.opacity && a3 > 1200 && (c2 = document.createElement("img"), P(c2, "fancybox-ghost"), c2.src = o2, n2.appendChild(c2));
          const h2 = () => {
            c2 && (P(c2, "f-fadeFastOut"), setTimeout(() => {
              c2 && (c2.remove(), c2 = null);
            }, 200));
          };
          (l2 = o2, new Promise((t3, e4) => {
            const i3 = new Image();
            i3.onload = t3, i3.onerror = e4, i3.src = l2;
          })).then(() => {
            i2.hideLoading(t2), t2.state = rt.Opening, this.instance.emit("reveal", t2), this.zoomIn(t2).then(() => {
              h2(), this.instance.done(t2);
            }, () => {
            }), c2 && setTimeout(() => {
              h2();
            }, a3 > 2500 ? 800 : 200);
          }, () => {
            i2.hideLoading(t2), i2.revealContent(t2);
          });
        } else {
          const n3 = this.optionFor(t2, "initialSize"), s3 = this.optionFor(t2, "zoom"), o3 = { event: i2.prevMouseMoveEvent || i2.options.event, friction: s3 ? 0.12 : 0 };
          let a3 = i2.optionFor(t2, "showClass") || void 0, r3 = true;
          i2.isOpeningSlide(t2) && ("full" === n3 ? e3.zoomToFull(o3) : "cover" === n3 ? e3.zoomToCover(o3) : "max" === n3 ? e3.zoomToMax(o3) : r3 = false, e3.stop("current")), r3 && a3 && (a3 = e3.isDragging ? "f-fadeIn" : ""), i2.hideLoading(t2), i2.revealContent(t2, a3);
        }
        var l2;
      }, () => {
        i2.setError(t2, "{{IMAGE_ERROR}}");
      });
    }
    process(t2, e2) {
      return new Promise((i2, s2) => {
        var o2;
        const a2 = this.instance, r2 = t2.el;
        a2.clearContent(t2), a2.showLoading(t2);
        let l2 = this.optionFor(t2, "content");
        if ("string" == typeof l2 && (l2 = n(l2)), !l2 || !E(l2)) {
          if (l2 = document.createElement("img"), l2 instanceof HTMLImageElement) {
            let i3 = "", n2 = t2.caption;
            i3 = "string" == typeof n2 && n2 ? n2.replace(/<[^>]+>/gi, "").substring(0, 1e3) : `Image ${t2.index + 1} of ${(null === (o2 = a2.carousel) || void 0 === o2 ? void 0 : o2.pages.length) || 1}`, l2.src = e2 || "", l2.alt = i3, l2.draggable = false, t2.srcset && l2.setAttribute("srcset", t2.srcset), this.instance.isOpeningSlide(t2) && (l2.fetchPriority = "high");
          }
          t2.sizes && l2.setAttribute("sizes", t2.sizes);
        }
        P(l2, "fancybox-image"), t2.imageEl = l2, a2.setContent(t2, l2, false);
        t2.panzoom = new k(r2, u({ transformParent: true }, this.option("Panzoom") || {}, { content: l2, width: a2.optionFor(t2, "width", "auto"), height: a2.optionFor(t2, "height", "auto"), wheel: () => {
          const t3 = a2.option("wheel");
          return ("zoom" === t3 || "pan" == t3) && t3;
        }, click: (e3, i3) => {
          var n2, s3;
          if (a2.isCompact || a2.isClosing())
            return false;
          if (t2.index !== (null === (n2 = a2.getSlide()) || void 0 === n2 ? void 0 : n2.index))
            return false;
          if (i3) {
            const t3 = i3.composedPath()[0];
            if (["A", "BUTTON", "TEXTAREA", "OPTION", "INPUT", "SELECT", "VIDEO"].includes(t3.nodeName))
              return false;
          }
          let o3 = !i3 || i3.target && (null === (s3 = t2.contentEl) || void 0 === s3 ? void 0 : s3.contains(i3.target));
          return a2.option(o3 ? "contentClick" : "backdropClick") || false;
        }, dblClick: () => a2.isCompact ? "toggleZoom" : a2.option("contentDblClick") || false, spinner: false, panOnlyZoomed: true, wheelLimit: 1 / 0, on: { ready: (t3) => {
          i2(t3);
        }, error: () => {
          s2();
        }, destroy: () => {
          s2();
        } } }));
      });
    }
    zoomIn(t2) {
      return new Promise((e2, i2) => {
        const n2 = this.instance, s2 = n2.container, { panzoom: o2, contentEl: a2, el: r2 } = t2;
        o2 && o2.updateMetrics();
        const l2 = this.getZoomInfo(t2);
        if (!(l2 && r2 && a2 && o2 && s2))
          return void i2();
        const { x: c2, y: h2, scale: d2, opacity: u2 } = l2, p2 = () => {
          t2.state !== rt.Closing && (u2 && (a2.style.opacity = Math.max(Math.min(1, 1 - (1 - o2.scale) / (1 - d2)), 0) + ""), o2.scale >= 1 && o2.scale > o2.targetScale - 0.1 && e2(o2));
        }, f2 = (t3) => {
          (t3.scale < 0.99 || t3.scale > 1.01) && !t3.isDragging || (S(s2, bt), a2.style.opacity = "", t3.off("endAnimation", f2), t3.off("touchStart", f2), t3.off("afterTransform", p2), e2(t3));
        };
        o2.on("endAnimation", f2), o2.on("touchStart", f2), o2.on("afterTransform", p2), o2.on(["error", "destroy"], () => {
          i2();
        }), o2.panTo({ x: c2, y: h2, scale: d2, friction: 0, ignoreBounds: true }), o2.stop("current");
        const g2 = { event: "mousemove" === o2.panMode ? n2.prevMouseMoveEvent || n2.options.event : void 0 }, m2 = this.optionFor(t2, "initialSize");
        P(s2, bt), n2.hideLoading(t2), "full" === m2 ? o2.zoomToFull(g2) : "cover" === m2 ? o2.zoomToCover(g2) : "max" === m2 ? o2.zoomToMax(g2) : o2.reset(0.172);
      });
    }
    getZoomInfo(t2) {
      const { el: e2, imageEl: i2, thumbEl: n2, panzoom: s2 } = t2, o2 = this.instance, a2 = o2.container;
      if (!e2 || !i2 || !n2 || !s2 || Q(n2) < 3 || !this.optionFor(t2, "zoom") || !a2 || o2.state === at.Destroy)
        return false;
      if ("0" === getComputedStyle(a2).getPropertyValue("--f-images-zoom"))
        return false;
      const r2 = window.visualViewport || null;
      if (1 !== (r2 ? r2.scale : 1))
        return false;
      let { top: l2, left: c2, width: h2, height: d2 } = n2.getBoundingClientRect(), { top: u2, left: p2, fitWidth: f2, fitHeight: g2 } = s2.contentRect;
      if (!(h2 && d2 && f2 && g2))
        return false;
      const m2 = s2.container.getBoundingClientRect();
      p2 += m2.left, u2 += m2.top;
      const v2 = -1 * (p2 + 0.5 * f2 - (c2 + 0.5 * h2)), b2 = -1 * (u2 + 0.5 * g2 - (l2 + 0.5 * d2)), y2 = h2 / f2;
      let w2 = this.option("zoomOpacity") || false;
      return "auto" === w2 && (w2 = Math.abs(h2 / d2 - f2 / g2) > 0.1), { x: v2, y: b2, scale: y2, opacity: w2 };
    }
    attach() {
      const t2 = this, e2 = t2.instance;
      e2.on("Carousel.change", t2.onChange), e2.on("Carousel.createSlide", t2.onCreateSlide), e2.on("Carousel.removeSlide", t2.onRemoveSlide), e2.on("close", t2.onClose);
    }
    detach() {
      const t2 = this, e2 = t2.instance;
      e2.off("Carousel.change", t2.onChange), e2.off("Carousel.createSlide", t2.onCreateSlide), e2.off("Carousel.removeSlide", t2.onRemoveSlide), e2.off("close", t2.onClose);
    }
  };
  Object.defineProperty(yt, "defaults", { enumerable: true, configurable: true, writable: true, value: { initialSize: "fit", Panzoom: { maxScale: 1 }, protected: false, zoom: true, zoomOpacity: "auto" } }), "function" == typeof SuppressedError && SuppressedError;
  var wt = "html";
  var xt = "image";
  var Et = "map";
  var St = "youtube";
  var Pt = "vimeo";
  var Ct = "html5video";
  var Tt = (t2, e2 = {}) => {
    const i2 = new URL(t2), n2 = new URLSearchParams(i2.search), s2 = new URLSearchParams();
    for (const [t3, i3] of [...n2, ...Object.entries(e2)]) {
      let e3 = i3 + "";
      if ("t" === t3) {
        let t4 = e3.match(/((\d*)m)?(\d*)s?/);
        t4 && s2.set("start", 60 * parseInt(t4[2] || "0") + parseInt(t4[3] || "0") + "");
      } else
        s2.set(t3, e3);
    }
    let o2 = s2 + "", a2 = t2.match(/#t=((.*)?\d+s)/);
    return a2 && (o2 += `#t=${a2[1]}`), o2;
  };
  var Mt = { ajax: null, autoSize: true, iframeAttr: { allow: "autoplay; fullscreen", scrolling: "auto" }, preload: true, videoAutoplay: true, videoRatio: 16 / 9, videoTpl: `<video class="fancybox__html5video" playsinline controls controlsList="nodownload" poster="{{poster}}">
  <source src="{{src}}" type="{{format}}" />Sorry, your browser doesn't support embedded videos.</video>`, videoFormat: "", vimeo: { byline: 1, color: "00adef", controls: 1, dnt: 1, muted: 0 }, youtube: { controls: 1, enablejsapi: 1, nocookie: 1, rel: 0, fs: 1 } };
  var Ot = ["image", "html", "ajax", "inline", "clone", "iframe", "map", "pdf", "html5video", "youtube", "vimeo"];
  var At = class extends N {
    onBeforeInitSlide(t2, e2, i2) {
      this.processType(i2);
    }
    onCreateSlide(t2, e2, i2) {
      this.setContent(i2);
    }
    onClearContent(t2, e2) {
      e2.xhr && (e2.xhr.abort(), e2.xhr = null);
      const i2 = e2.iframeEl;
      i2 && (i2.onload = i2.onerror = null, i2.src = "//about:blank", e2.iframeEl = null);
      const n2 = e2.contentEl, s2 = e2.placeholderEl;
      if ("inline" === e2.type && n2 && s2)
        n2.classList.remove("fancybox__content"), "none" !== n2.style.display && (n2.style.display = "none"), s2.parentNode && s2.parentNode.insertBefore(n2, s2), s2.remove(), e2.contentEl = void 0, e2.placeholderEl = void 0;
      else
        for (; e2.el && e2.el.firstChild; )
          e2.el.removeChild(e2.el.firstChild);
    }
    onSelectSlide(t2, e2, i2) {
      i2.state === rt.Ready && this.playVideo();
    }
    onUnselectSlide(t2, e2, i2) {
      var n2, s2;
      if (i2.type === Ct) {
        try {
          null === (s2 = null === (n2 = i2.el) || void 0 === n2 ? void 0 : n2.querySelector("video")) || void 0 === s2 || s2.pause();
        } catch (t3) {
        }
        return;
      }
      let o2;
      i2.type === Pt ? o2 = { method: "pause", value: "true" } : i2.type === St && (o2 = { event: "command", func: "pauseVideo" }), o2 && i2.iframeEl && i2.iframeEl.contentWindow && i2.iframeEl.contentWindow.postMessage(JSON.stringify(o2), "*"), i2.poller && clearTimeout(i2.poller);
    }
    onDone(t2, e2) {
      t2.isCurrentSlide(e2) && !t2.isClosing() && this.playVideo();
    }
    onRefresh(t2, e2) {
      e2.slides.forEach((t3) => {
        t3.el && (this.resizeIframe(t3), this.setAspectRatio(t3));
      });
    }
    onMessage(t2) {
      try {
        let e2 = JSON.parse(t2.data);
        if ("https://player.vimeo.com" === t2.origin) {
          if ("ready" === e2.event)
            for (let e3 of Array.from(document.getElementsByClassName("fancybox__iframe")))
              e3 instanceof HTMLIFrameElement && e3.contentWindow === t2.source && (e3.dataset.ready = "true");
        } else if (t2.origin.match(/^https:\/\/(www.)?youtube(-nocookie)?.com$/) && "onReady" === e2.event) {
          const t3 = document.getElementById(e2.id);
          t3 && (t3.dataset.ready = "true");
        }
      } catch (t3) {
      }
    }
    loadAjaxContent(t2) {
      const e2 = this.instance.optionFor(t2, "src") || "";
      this.instance.showLoading(t2);
      const i2 = this.instance, n2 = new XMLHttpRequest();
      i2.showLoading(t2), n2.onreadystatechange = function() {
        n2.readyState === XMLHttpRequest.DONE && i2.state === at.Ready && (i2.hideLoading(t2), 200 === n2.status ? i2.setContent(t2, n2.responseText) : i2.setError(t2, 404 === n2.status ? "{{AJAX_NOT_FOUND}}" : "{{AJAX_FORBIDDEN}}"));
      };
      const s2 = t2.ajax || null;
      n2.open(s2 ? "POST" : "GET", e2 + ""), n2.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"), n2.setRequestHeader("X-Requested-With", "XMLHttpRequest"), n2.send(s2), t2.xhr = n2;
    }
    setInlineContent(t2) {
      let e2 = null;
      if (E(t2.src))
        e2 = t2.src;
      else if ("string" == typeof t2.src) {
        const i2 = t2.src.split("#", 2).pop();
        e2 = i2 ? document.getElementById(i2) : null;
      }
      if (e2) {
        if ("clone" === t2.type || e2.closest(".fancybox__slide")) {
          e2 = e2.cloneNode(true);
          const i2 = e2.dataset.animationName;
          i2 && (e2.classList.remove(i2), delete e2.dataset.animationName);
          let n2 = e2.getAttribute("id");
          n2 = n2 ? `${n2}--clone` : `clone-${this.instance.id}-${t2.index}`, e2.setAttribute("id", n2);
        } else if (e2.parentNode) {
          const i2 = document.createElement("div");
          i2.classList.add("fancybox-placeholder"), e2.parentNode.insertBefore(i2, e2), t2.placeholderEl = i2;
        }
        this.instance.setContent(t2, e2);
      } else
        this.instance.setError(t2, "{{ELEMENT_NOT_FOUND}}");
    }
    setIframeContent(t2) {
      const { src: e2, el: i2 } = t2;
      if (!e2 || "string" != typeof e2 || !i2)
        return;
      i2.classList.add("is-loading");
      const n2 = this.instance, s2 = document.createElement("iframe");
      s2.className = "fancybox__iframe", s2.setAttribute("id", `fancybox__iframe_${n2.id}_${t2.index}`);
      for (const [e3, i3] of Object.entries(this.optionFor(t2, "iframeAttr") || {}))
        s2.setAttribute(e3, i3);
      s2.onerror = () => {
        n2.setError(t2, "{{IFRAME_ERROR}}");
      }, t2.iframeEl = s2;
      const o2 = this.optionFor(t2, "preload");
      if ("iframe" !== t2.type || false === o2)
        return s2.setAttribute("src", t2.src + ""), n2.setContent(t2, s2, false), this.resizeIframe(t2), void n2.revealContent(t2);
      n2.showLoading(t2), s2.onload = () => {
        if (!s2.src.length)
          return;
        const e3 = "true" !== s2.dataset.ready;
        s2.dataset.ready = "true", this.resizeIframe(t2), e3 ? n2.revealContent(t2) : n2.hideLoading(t2);
      }, s2.setAttribute("src", e2), n2.setContent(t2, s2, false);
    }
    resizeIframe(t2) {
      const { type: e2, iframeEl: i2 } = t2;
      if (e2 === St || e2 === Pt)
        return;
      const n2 = null == i2 ? void 0 : i2.parentElement;
      if (!i2 || !n2)
        return;
      let s2 = t2.autoSize;
      void 0 === s2 && (s2 = this.optionFor(t2, "autoSize"));
      let o2 = t2.width || 0, a2 = t2.height || 0;
      o2 && a2 && (s2 = false);
      const r2 = n2 && n2.style;
      if (false !== t2.preload && false !== s2 && r2)
        try {
          const t3 = window.getComputedStyle(n2), e3 = parseFloat(t3.paddingLeft) + parseFloat(t3.paddingRight), s3 = parseFloat(t3.paddingTop) + parseFloat(t3.paddingBottom), l2 = i2.contentWindow;
          if (l2) {
            const t4 = l2.document, i3 = t4.getElementsByTagName(wt)[0], n3 = t4.body;
            r2.width = "", n3.style.overflow = "hidden", o2 = o2 || i3.scrollWidth + e3, r2.width = `${o2}px`, n3.style.overflow = "", r2.flex = "0 0 auto", r2.height = `${n3.scrollHeight}px`, a2 = i3.scrollHeight + s3;
          }
        } catch (t3) {
        }
      if (o2 || a2) {
        const t3 = { flex: "0 1 auto", width: "", height: "" };
        o2 && "auto" !== o2 && (t3.width = `${o2}px`), a2 && "auto" !== a2 && (t3.height = `${a2}px`), Object.assign(r2, t3);
      }
    }
    playVideo() {
      const t2 = this.instance.getSlide();
      if (!t2)
        return;
      const { el: e2 } = t2;
      if (!e2 || !e2.offsetParent)
        return;
      if (!this.optionFor(t2, "videoAutoplay"))
        return;
      if (t2.type === Ct)
        try {
          const t3 = e2.querySelector("video");
          if (t3) {
            const e3 = t3.play();
            void 0 !== e3 && e3.then(() => {
            }).catch((e4) => {
              t3.muted = true, t3.play();
            });
          }
        } catch (t3) {
        }
      if (t2.type !== St && t2.type !== Pt)
        return;
      const i2 = () => {
        if (t2.iframeEl && t2.iframeEl.contentWindow) {
          let e3;
          if ("true" === t2.iframeEl.dataset.ready)
            return e3 = t2.type === St ? { event: "command", func: "playVideo" } : { method: "play", value: "true" }, e3 && t2.iframeEl.contentWindow.postMessage(JSON.stringify(e3), "*"), void (t2.poller = void 0);
          t2.type === St && (e3 = { event: "listening", id: t2.iframeEl.getAttribute("id") }, t2.iframeEl.contentWindow.postMessage(JSON.stringify(e3), "*"));
        }
        t2.poller = setTimeout(i2, 250);
      };
      i2();
    }
    processType(t2) {
      if (t2.html)
        return t2.type = wt, t2.src = t2.html, void (t2.html = "");
      const e2 = this.instance.optionFor(t2, "src", "");
      if (!e2 || "string" != typeof e2)
        return;
      let i2 = t2.type, n2 = null;
      if (n2 = e2.match(/(youtube\.com|youtu\.be|youtube\-nocookie\.com)\/(?:watch\?(?:.*&)?v=|v\/|u\/|shorts\/|embed\/?)?(videoseries\?list=(?:.*)|[\w-]{11}|\?listType=(?:.*)&list=(?:.*))(?:.*)/i)) {
        const s2 = this.optionFor(t2, St), { nocookie: o2 } = s2, a2 = function(t3, e3) {
          var i3 = {};
          for (var n3 in t3)
            Object.prototype.hasOwnProperty.call(t3, n3) && e3.indexOf(n3) < 0 && (i3[n3] = t3[n3]);
          if (null != t3 && "function" == typeof Object.getOwnPropertySymbols) {
            var s3 = 0;
            for (n3 = Object.getOwnPropertySymbols(t3); s3 < n3.length; s3++)
              e3.indexOf(n3[s3]) < 0 && Object.prototype.propertyIsEnumerable.call(t3, n3[s3]) && (i3[n3[s3]] = t3[n3[s3]]);
          }
          return i3;
        }(s2, ["nocookie"]), r2 = `www.youtube${o2 ? "-nocookie" : ""}.com`, l2 = Tt(e2, a2), c2 = encodeURIComponent(n2[2]);
        t2.videoId = c2, t2.src = `https://${r2}/embed/${c2}?${l2}`, t2.thumbSrc = t2.thumbSrc || `https://i.ytimg.com/vi/${c2}/mqdefault.jpg`, i2 = St;
      } else if (n2 = e2.match(/^.+vimeo.com\/(?:\/)?([\d]+)((\/|\?h=)([a-z0-9]+))?(.*)?/)) {
        const s2 = Tt(e2, this.optionFor(t2, Pt)), o2 = encodeURIComponent(n2[1]), a2 = n2[4] || "";
        t2.videoId = o2, t2.src = `https://player.vimeo.com/video/${o2}?${a2 ? `h=${a2}${s2 ? "&" : ""}` : ""}${s2}`, i2 = Pt;
      }
      if (!i2 && t2.triggerEl) {
        const e3 = t2.triggerEl.dataset.type;
        Ot.includes(e3) && (i2 = e3);
      }
      i2 || "string" == typeof e2 && ("#" === e2.charAt(0) ? i2 = "inline" : (n2 = e2.match(/\.(mp4|mov|ogv|webm)((\?|#).*)?$/i)) ? (i2 = Ct, t2.videoFormat = t2.videoFormat || "video/" + ("ogv" === n2[1] ? "ogg" : n2[1])) : e2.match(/(^data:image\/[a-z0-9+\/=]*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg|ico)((\?|#).*)?$)/i) ? i2 = xt : e2.match(/\.(pdf)((\?|#).*)?$/i) && (i2 = "pdf")), (n2 = e2.match(/(?:maps\.)?google\.([a-z]{2,3}(?:\.[a-z]{2})?)\/(?:(?:(?:maps\/(?:place\/(?:.*)\/)?\@(.*),(\d+.?\d+?)z))|(?:\?ll=))(.*)?/i)) ? (t2.src = `https://maps.google.${n2[1]}/?ll=${(n2[2] ? n2[2] + "&z=" + Math.floor(parseFloat(n2[3])) + (n2[4] ? n2[4].replace(/^\//, "&") : "") : n2[4] + "").replace(/\?/, "&")}&output=${n2[4] && n2[4].indexOf("layer=c") > 0 ? "svembed" : "embed"}`, i2 = Et) : (n2 = e2.match(/(?:maps\.)?google\.([a-z]{2,3}(?:\.[a-z]{2})?)\/(?:maps\/search\/)(.*)/i)) && (t2.src = `https://maps.google.${n2[1]}/maps?q=${n2[2].replace("query=", "q=").replace("api=1", "")}&output=embed`, i2 = Et), i2 = i2 || this.instance.option("defaultType"), t2.type = i2, i2 === xt && (t2.thumbSrc = t2.thumbSrc || t2.src);
    }
    setContent(t2) {
      const e2 = this.instance.optionFor(t2, "src") || "";
      if (t2 && t2.type && e2) {
        switch (t2.type) {
          case wt:
            this.instance.setContent(t2, e2);
            break;
          case Ct:
            const i2 = this.option("videoTpl");
            i2 && this.instance.setContent(t2, i2.replace(/\{\{src\}\}/gi, e2 + "").replace(/\{\{format\}\}/gi, this.optionFor(t2, "videoFormat") || "").replace(/\{\{poster\}\}/gi, t2.poster || t2.thumbSrc || ""));
            break;
          case "inline":
          case "clone":
            this.setInlineContent(t2);
            break;
          case "ajax":
            this.loadAjaxContent(t2);
            break;
          case "pdf":
          case Et:
          case St:
          case Pt:
            t2.preload = false;
          case "iframe":
            this.setIframeContent(t2);
        }
        this.setAspectRatio(t2);
      }
    }
    setAspectRatio(t2) {
      const e2 = t2.contentEl;
      if (!(t2.el && e2 && t2.type && [St, Pt, Ct].includes(t2.type)))
        return;
      let i2, n2 = t2.width || "auto", s2 = t2.height || "auto";
      if ("auto" === n2 || "auto" === s2) {
        i2 = this.optionFor(t2, "videoRatio");
        const e3 = (i2 + "").match(/(\d+)\s*\/\s?(\d+)/);
        i2 = e3 && e3.length > 2 ? parseFloat(e3[1]) / parseFloat(e3[2]) : parseFloat(i2 + "");
      } else
        n2 && s2 && (i2 = n2 / s2);
      if (!i2)
        return;
      e2.style.aspectRatio = "", e2.style.width = "", e2.style.height = "", e2.offsetHeight;
      const o2 = e2.getBoundingClientRect(), a2 = o2.width || 1, r2 = o2.height || 1;
      e2.style.aspectRatio = i2 + "", i2 < a2 / r2 ? (s2 = "auto" === s2 ? r2 : Math.min(r2, s2), e2.style.width = "auto", e2.style.height = `${s2}px`) : (n2 = "auto" === n2 ? a2 : Math.min(a2, n2), e2.style.width = `${n2}px`, e2.style.height = "auto");
    }
    attach() {
      const t2 = this, e2 = t2.instance;
      e2.on("Carousel.beforeInitSlide", t2.onBeforeInitSlide), e2.on("Carousel.createSlide", t2.onCreateSlide), e2.on("Carousel.selectSlide", t2.onSelectSlide), e2.on("Carousel.unselectSlide", t2.onUnselectSlide), e2.on("Carousel.Panzoom.refresh", t2.onRefresh), e2.on("done", t2.onDone), e2.on("clearContent", t2.onClearContent), window.addEventListener("message", t2.onMessage);
    }
    detach() {
      const t2 = this, e2 = t2.instance;
      e2.off("Carousel.beforeInitSlide", t2.onBeforeInitSlide), e2.off("Carousel.createSlide", t2.onCreateSlide), e2.off("Carousel.selectSlide", t2.onSelectSlide), e2.off("Carousel.unselectSlide", t2.onUnselectSlide), e2.off("Carousel.Panzoom.refresh", t2.onRefresh), e2.off("done", t2.onDone), e2.off("clearContent", t2.onClearContent), window.removeEventListener("message", t2.onMessage);
    }
  };
  Object.defineProperty(At, "defaults", { enumerable: true, configurable: true, writable: true, value: Mt });
  var Lt = "play";
  var zt = "pause";
  var Rt = "ready";
  var kt = class extends N {
    constructor() {
      super(...arguments), Object.defineProperty(this, "state", { enumerable: true, configurable: true, writable: true, value: Rt }), Object.defineProperty(this, "inHover", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "timer", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "progressBar", { enumerable: true, configurable: true, writable: true, value: null });
    }
    get isActive() {
      return this.state !== Rt;
    }
    onReady(t2) {
      this.option("autoStart") && (t2.isInfinite || t2.page < t2.pages.length - 1) && this.start();
    }
    onChange() {
      this.removeProgressBar(), this.pause();
    }
    onSettle() {
      this.resume();
    }
    onVisibilityChange() {
      "visible" === document.visibilityState ? this.resume() : this.pause();
    }
    onMouseEnter() {
      this.inHover = true, this.pause();
    }
    onMouseLeave() {
      var t2;
      this.inHover = false, (null === (t2 = this.instance.panzoom) || void 0 === t2 ? void 0 : t2.isResting) && this.resume();
    }
    onTimerEnd() {
      const t2 = this.instance;
      "play" === this.state && (t2.isInfinite || t2.page !== t2.pages.length - 1 ? t2.slideNext() : t2.slideTo(0));
    }
    removeProgressBar() {
      this.progressBar && (this.progressBar.remove(), this.progressBar = null);
    }
    createProgressBar() {
      var t2;
      if (!this.option("showProgress"))
        return null;
      this.removeProgressBar();
      const e2 = this.instance, i2 = (null === (t2 = e2.pages[e2.page]) || void 0 === t2 ? void 0 : t2.slides) || [];
      let n2 = this.option("progressParentEl");
      if (n2 || (n2 = (1 === i2.length ? i2[0].el : null) || e2.viewport), !n2)
        return null;
      const s2 = document.createElement("div");
      return P(s2, "f-progress"), n2.prepend(s2), this.progressBar = s2, s2.offsetHeight, s2;
    }
    set() {
      const t2 = this, e2 = t2.instance;
      if (e2.pages.length < 2)
        return;
      if (t2.timer)
        return;
      const i2 = t2.option("timeout");
      t2.state = Lt, P(e2.container, "has-autoplay");
      let n2 = t2.createProgressBar();
      n2 && (n2.style.transitionDuration = `${i2}ms`, n2.style.transform = "scaleX(1)"), t2.timer = setTimeout(() => {
        t2.timer = null, t2.inHover || t2.onTimerEnd();
      }, i2), t2.emit("set");
    }
    clear() {
      const t2 = this;
      t2.timer && (clearTimeout(t2.timer), t2.timer = null), t2.removeProgressBar();
    }
    start() {
      const t2 = this;
      if (t2.set(), t2.state !== Rt) {
        if (t2.option("pauseOnHover")) {
          const e2 = t2.instance.container;
          e2.addEventListener("mouseenter", t2.onMouseEnter, false), e2.addEventListener("mouseleave", t2.onMouseLeave, false);
        }
        document.addEventListener("visibilitychange", t2.onVisibilityChange, false), t2.emit("start");
      }
    }
    stop() {
      const t2 = this, e2 = t2.state, i2 = t2.instance.container;
      t2.clear(), t2.state = Rt, i2.removeEventListener("mouseenter", t2.onMouseEnter, false), i2.removeEventListener("mouseleave", t2.onMouseLeave, false), document.removeEventListener("visibilitychange", t2.onVisibilityChange, false), S(i2, "has-autoplay"), e2 !== Rt && t2.emit("stop");
    }
    pause() {
      const t2 = this;
      t2.state === Lt && (t2.state = zt, t2.clear(), t2.emit(zt));
    }
    resume() {
      const t2 = this, e2 = t2.instance;
      if (e2.isInfinite || e2.page !== e2.pages.length - 1)
        if (t2.state !== Lt) {
          if (t2.state === zt && !t2.inHover) {
            const e3 = new Event("resume", { bubbles: true, cancelable: true });
            t2.emit("resume", e3), e3.defaultPrevented || t2.set();
          }
        } else
          t2.set();
      else
        t2.stop();
    }
    toggle() {
      this.state === Lt || this.state === zt ? this.stop() : this.start();
    }
    attach() {
      const t2 = this, e2 = t2.instance;
      e2.on("ready", t2.onReady), e2.on("Panzoom.startAnimation", t2.onChange), e2.on("Panzoom.endAnimation", t2.onSettle), e2.on("Panzoom.touchMove", t2.onChange);
    }
    detach() {
      const t2 = this, e2 = t2.instance;
      e2.off("ready", t2.onReady), e2.off("Panzoom.startAnimation", t2.onChange), e2.off("Panzoom.endAnimation", t2.onSettle), e2.off("Panzoom.touchMove", t2.onChange), t2.stop();
    }
  };
  Object.defineProperty(kt, "defaults", { enumerable: true, configurable: true, writable: true, value: { autoStart: true, pauseOnHover: true, progressParentEl: null, showProgress: true, timeout: 3e3 } });
  var It = class extends N {
    constructor() {
      super(...arguments), Object.defineProperty(this, "ref", { enumerable: true, configurable: true, writable: true, value: null });
    }
    onPrepare(t2) {
      const e2 = t2.carousel;
      if (!e2)
        return;
      const i2 = t2.container;
      i2 && (e2.options.Autoplay = u({ autoStart: false }, this.option("Autoplay") || {}, { pauseOnHover: false, timeout: this.option("timeout"), progressParentEl: () => this.option("progressParentEl") || null, on: { start: () => {
        t2.emit("startSlideshow");
      }, set: (e3) => {
        var n2;
        i2.classList.add("has-slideshow"), (null === (n2 = t2.getSlide()) || void 0 === n2 ? void 0 : n2.state) !== rt.Ready && e3.pause();
      }, stop: () => {
        i2.classList.remove("has-slideshow"), t2.isCompact || t2.endIdle(), t2.emit("endSlideshow");
      }, resume: (e3, i3) => {
        var n2, s2, o2;
        !i3 || !i3.cancelable || (null === (n2 = t2.getSlide()) || void 0 === n2 ? void 0 : n2.state) === rt.Ready && (null === (o2 = null === (s2 = t2.carousel) || void 0 === s2 ? void 0 : s2.panzoom) || void 0 === o2 ? void 0 : o2.isResting) || i3.preventDefault();
      } } }), e2.attachPlugins({ Autoplay: kt }), this.ref = e2.plugins.Autoplay);
    }
    onReady(t2) {
      const e2 = t2.carousel, i2 = this.ref;
      i2 && e2 && this.option("playOnStart") && (e2.isInfinite || e2.page < e2.pages.length - 1) && i2.start();
    }
    onDone(t2, e2) {
      const i2 = this.ref, n2 = t2.carousel;
      if (!i2 || !n2)
        return;
      const s2 = e2.panzoom;
      s2 && s2.on("startAnimation", () => {
        t2.isCurrentSlide(e2) && i2.stop();
      }), t2.isCurrentSlide(e2) && i2.resume();
    }
    onKeydown(t2, e2) {
      var i2;
      const n2 = this.ref;
      n2 && e2 === this.option("key") && "BUTTON" !== (null === (i2 = document.activeElement) || void 0 === i2 ? void 0 : i2.nodeName) && n2.toggle();
    }
    attach() {
      const t2 = this, e2 = t2.instance;
      e2.on("Carousel.init", t2.onPrepare), e2.on("Carousel.ready", t2.onReady), e2.on("done", t2.onDone), e2.on("keydown", t2.onKeydown);
    }
    detach() {
      const t2 = this, e2 = t2.instance;
      e2.off("Carousel.init", t2.onPrepare), e2.off("Carousel.ready", t2.onReady), e2.off("done", t2.onDone), e2.off("keydown", t2.onKeydown);
    }
  };
  Object.defineProperty(It, "defaults", { enumerable: true, configurable: true, writable: true, value: { key: " ", playOnStart: false, progressParentEl: (t2) => {
    var e2;
    return (null === (e2 = t2.instance.container) || void 0 === e2 ? void 0 : e2.querySelector(".fancybox__toolbar [data-fancybox-toggle-slideshow]")) || t2.instance.container;
  }, timeout: 3e3 } });
  var Dt = { classes: { container: "f-thumbs f-carousel__thumbs", viewport: "f-thumbs__viewport", track: "f-thumbs__track", slide: "f-thumbs__slide", isResting: "is-resting", isSelected: "is-selected", isLoading: "is-loading", hasThumbs: "has-thumbs" }, minCount: 2, parentEl: null, thumbTpl: '<button class="f-thumbs__slide__button" tabindex="0" type="button" aria-label="{{GOTO}}" data-carousel-index="%i"><img class="f-thumbs__slide__img" data-lazy-src="{{%s}}" alt="" /></button>', type: "modern" };
  var Ft;
  !function(t2) {
    t2[t2.Init = 0] = "Init", t2[t2.Ready = 1] = "Ready", t2[t2.Hidden = 2] = "Hidden";
  }(Ft || (Ft = {}));
  var jt = "isResting";
  var Bt = "thumbWidth";
  var Ht = "thumbHeight";
  var Nt = "thumbClipWidth";
  var _t = class extends N {
    constructor() {
      super(...arguments), Object.defineProperty(this, "type", { enumerable: true, configurable: true, writable: true, value: "modern" }), Object.defineProperty(this, "container", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "track", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "carousel", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "thumbWidth", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "thumbClipWidth", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "thumbHeight", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "thumbGap", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "thumbExtraGap", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "state", { enumerable: true, configurable: true, writable: true, value: Ft.Init });
    }
    get isModern() {
      return "modern" === this.type;
    }
    onInitSlide(t2, e2) {
      const i2 = e2.el ? e2.el.dataset : void 0;
      i2 && (e2.thumbSrc = i2.thumbSrc || e2.thumbSrc || "", e2[Nt] = parseFloat(i2[Nt] || "") || e2[Nt] || 0, e2[Ht] = parseFloat(i2.thumbHeight || "") || e2[Ht] || 0), this.addSlide(e2);
    }
    onInitSlides() {
      this.build();
    }
    onChange() {
      var t2;
      if (!this.isModern)
        return;
      const e2 = this.container, i2 = this.instance, n2 = i2.panzoom, s2 = this.carousel, a2 = s2 ? s2.panzoom : null, r2 = i2.page;
      if (n2 && s2 && a2) {
        if (n2.isDragging) {
          S(e2, this.cn(jt));
          let n3 = (null === (t2 = s2.pages[r2]) || void 0 === t2 ? void 0 : t2.pos) || 0;
          n3 += i2.getProgress(r2) * (this[Nt] + this.thumbGap);
          let o2 = a2.getBounds();
          -1 * n3 > o2.x.min && -1 * n3 < o2.x.max && a2.panTo({ x: -1 * n3, friction: 0.12 });
        } else
          o(e2, this.cn(jt), n2.isResting);
        this.shiftModern();
      }
    }
    onRefresh() {
      this.updateProps();
      for (const t2 of this.instance.slides || [])
        this.resizeModernSlide(t2);
      this.shiftModern();
    }
    isDisabled() {
      const t2 = this.option("minCount") || 0;
      if (t2) {
        const e3 = this.instance;
        let i2 = 0;
        for (const t3 of e3.slides || [])
          t3.thumbSrc && i2++;
        if (i2 < t2)
          return true;
      }
      const e2 = this.option("type");
      return ["modern", "classic"].indexOf(e2) < 0;
    }
    getThumb(t2) {
      const e2 = this.option("thumbTpl") || "";
      return { html: this.instance.localize(e2, [["%i", t2.index], ["%d", t2.index + 1], ["%s", t2.thumbSrc || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"]]) };
    }
    addSlide(t2) {
      const e2 = this.carousel;
      e2 && e2.addSlide(t2.index, this.getThumb(t2));
    }
    getSlides() {
      const t2 = [];
      for (const e2 of this.instance.slides || [])
        t2.push(this.getThumb(e2));
      return t2;
    }
    resizeModernSlide(t2) {
      this.isModern && (t2[Bt] = t2[Nt] && t2[Ht] ? Math.round(this[Ht] * (t2[Nt] / t2[Ht])) : this[Bt]);
    }
    updateProps() {
      const t2 = this.container;
      if (!t2)
        return;
      const e2 = (e3) => parseFloat(getComputedStyle(t2).getPropertyValue("--f-thumb-" + e3)) || 0;
      this.thumbGap = e2("gap"), this.thumbExtraGap = e2("extra-gap"), this[Bt] = e2("width") || 40, this[Nt] = e2("clip-width") || 40, this[Ht] = e2("height") || 40;
    }
    build() {
      const t2 = this;
      if (t2.state !== Ft.Init)
        return;
      if (t2.isDisabled())
        return void t2.emit("disabled");
      const e2 = t2.instance, i2 = e2.container, n2 = t2.getSlides(), s2 = t2.option("type");
      t2.type = s2;
      const o2 = t2.option("parentEl"), a2 = t2.cn("container"), r2 = t2.cn("track");
      let l2 = null == o2 ? void 0 : o2.querySelector("." + a2);
      l2 || (l2 = document.createElement("div"), P(l2, a2), o2 ? o2.appendChild(l2) : i2.after(l2)), P(l2, `is-${s2}`), P(i2, t2.cn("hasThumbs")), t2.container = l2, t2.updateProps();
      let c2 = l2.querySelector("." + r2);
      c2 || (c2 = document.createElement("div"), P(c2, t2.cn("track")), l2.appendChild(c2)), t2.track = c2;
      const h2 = u({}, { track: c2, infinite: false, center: true, fill: "classic" === s2, dragFree: true, slidesPerPage: 1, transition: false, preload: 0.25, friction: 0.12, Panzoom: { maxVelocity: 0 }, Dots: false, Navigation: false, classes: { container: "f-thumbs", viewport: "f-thumbs__viewport", track: "f-thumbs__track", slide: "f-thumbs__slide" } }, t2.option("Carousel") || {}, { Sync: { target: e2 }, slides: n2 }), d2 = new e2.constructor(l2, h2);
      d2.on("createSlide", (e3, i3) => {
        t2.setProps(i3.index), t2.emit("createSlide", i3, i3.el);
      }), d2.on("ready", () => {
        t2.shiftModern(), t2.emit("ready");
      }), d2.on("refresh", () => {
        t2.shiftModern();
      }), d2.on("Panzoom.click", (e3, i3, n3) => {
        t2.onClick(n3);
      }), t2.carousel = d2, t2.state = Ft.Ready;
    }
    onClick(t2) {
      t2.preventDefault(), t2.stopPropagation();
      const e2 = this.instance, { pages: i2, page: n2 } = e2, s2 = (t3) => {
        if (t3) {
          const e3 = t3.closest("[data-carousel-index]");
          if (e3)
            return [parseInt(e3.dataset.carouselIndex || "", 10) || 0, e3];
        }
        return [-1, void 0];
      }, o2 = (t3, e3) => {
        const i3 = document.elementFromPoint(t3, e3);
        return i3 ? s2(i3) : [-1, void 0];
      };
      let [a2, r2] = s2(t2.target);
      if (a2 > -1)
        return;
      const l2 = this[Nt], c2 = t2.clientX, h2 = t2.clientY;
      let [d2, u2] = o2(c2 - l2, h2), [p2, f2] = o2(c2 + l2, h2);
      u2 && f2 ? (a2 = Math.abs(c2 - u2.getBoundingClientRect().right) < Math.abs(c2 - f2.getBoundingClientRect().left) ? d2 : p2, a2 === n2 && (a2 = a2 === d2 ? p2 : d2)) : u2 ? a2 = d2 : f2 && (a2 = p2), a2 > -1 && i2[a2] && e2.slideTo(a2);
    }
    getShift(t2) {
      var e2;
      const i2 = this, { instance: n2 } = i2, s2 = i2.carousel;
      if (!n2 || !s2)
        return 0;
      const o2 = i2[Bt], a2 = i2[Nt], r2 = i2.thumbGap, l2 = i2.thumbExtraGap;
      if (!(null === (e2 = s2.slides[t2]) || void 0 === e2 ? void 0 : e2.el))
        return 0;
      const c2 = 0.5 * (o2 - a2), h2 = n2.pages.length - 1;
      let d2 = n2.getProgress(0), u2 = n2.getProgress(h2), p2 = n2.getProgress(t2, false, true), f2 = 0, g2 = c2 + l2 + r2;
      const m2 = d2 < 0 && d2 > -1, v2 = u2 > 0 && u2 < 1;
      return 0 === t2 ? (f2 = g2 * Math.abs(d2), v2 && 1 === d2 && (f2 -= g2 * Math.abs(u2))) : t2 === h2 ? (f2 = g2 * Math.abs(u2) * -1, m2 && -1 === u2 && (f2 += g2 * Math.abs(d2))) : m2 || v2 ? (f2 = -1 * g2, f2 += g2 * Math.abs(d2), f2 += g2 * (1 - Math.abs(u2))) : f2 = g2 * p2, f2;
    }
    setProps(e2) {
      var i2;
      const n2 = this;
      if (!n2.isModern)
        return;
      const { instance: s2 } = n2, o2 = n2.carousel;
      if (s2 && o2) {
        const a2 = null === (i2 = o2.slides[e2]) || void 0 === i2 ? void 0 : i2.el;
        if (a2 && a2.childNodes.length) {
          let i3 = t(1 - Math.abs(s2.getProgress(e2))), o3 = t(n2.getShift(e2));
          a2.style.setProperty("--progress", i3 ? i3 + "" : ""), a2.style.setProperty("--shift", o3 + "");
        }
      }
    }
    shiftModern() {
      const t2 = this;
      if (!t2.isModern)
        return;
      const { instance: e2, track: i2 } = t2, n2 = e2.panzoom, s2 = t2.carousel;
      if (!(e2 && i2 && n2 && s2))
        return;
      if (n2.state === m.Init || n2.state === m.Destroy)
        return;
      for (const i3 of e2.slides)
        t2.setProps(i3.index);
      let o2 = (t2[Nt] + t2.thumbGap) * (s2.slides.length || 0);
      i2.style.setProperty("--width", o2 + "");
    }
    cleanup() {
      const t2 = this;
      t2.carousel && t2.carousel.destroy(), t2.carousel = null, t2.container && t2.container.remove(), t2.container = null, t2.track && t2.track.remove(), t2.track = null, t2.state = Ft.Init, S(t2.instance.container, t2.cn("hasThumbs"));
    }
    attach() {
      const t2 = this, e2 = t2.instance;
      e2.on("initSlide", t2.onInitSlide), e2.state === j.Init ? e2.on("initSlides", t2.onInitSlides) : t2.onInitSlides(), e2.on(["change", "Panzoom.afterTransform"], t2.onChange), e2.on("Panzoom.refresh", t2.onRefresh);
    }
    detach() {
      const t2 = this, e2 = t2.instance;
      e2.off("initSlide", t2.onInitSlide), e2.off("initSlides", t2.onInitSlides), e2.off(["change", "Panzoom.afterTransform"], t2.onChange), e2.off("Panzoom.refresh", t2.onRefresh), t2.cleanup();
    }
  };
  Object.defineProperty(_t, "defaults", { enumerable: true, configurable: true, writable: true, value: Dt });
  var $t = Object.assign(Object.assign({}, Dt), { key: "t", showOnStart: true, parentEl: null });
  var Wt = "is-masked";
  var Xt = "aria-hidden";
  var qt = class extends N {
    constructor() {
      super(...arguments), Object.defineProperty(this, "ref", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "hidden", { enumerable: true, configurable: true, writable: true, value: false });
    }
    get isEnabled() {
      const t2 = this.ref;
      return t2 && !t2.isDisabled();
    }
    get isHidden() {
      return this.hidden;
    }
    onClick(t2, e2) {
      e2.stopPropagation();
    }
    onCreateSlide(t2, e2) {
      var i2, n2, s2;
      const o2 = (null === (s2 = null === (n2 = null === (i2 = this.instance) || void 0 === i2 ? void 0 : i2.carousel) || void 0 === n2 ? void 0 : n2.slides[e2.index]) || void 0 === s2 ? void 0 : s2.type) || "", a2 = e2.el;
      if (a2 && o2) {
        let t3 = `for-${o2}`;
        ["video", "youtube", "vimeo", "html5video"].includes(o2) && (t3 += " for-video"), P(a2, t3);
      }
    }
    onInit() {
      var t2;
      const e2 = this, i2 = e2.instance, n2 = i2.carousel;
      if (e2.ref || !n2)
        return;
      const s2 = e2.option("parentEl") || i2.footer || i2.container;
      if (!s2)
        return;
      const o2 = u({}, e2.options, { parentEl: s2, classes: { container: "f-thumbs fancybox__thumbs" }, Carousel: { Sync: { friction: i2.option("Carousel.friction") || 0 } }, on: { ready: (t3) => {
        const i3 = t3.container;
        i3 && this.hidden && (e2.refresh(), i3.style.transition = "none", e2.hide(), i3.offsetHeight, queueMicrotask(() => {
          i3.style.transition = "", e2.show();
        }));
      } } });
      o2.Carousel = o2.Carousel || {}, o2.Carousel.on = u((null === (t2 = e2.options.Carousel) || void 0 === t2 ? void 0 : t2.on) || {}, { click: this.onClick, createSlide: this.onCreateSlide }), n2.options.Thumbs = o2, n2.attachPlugins({ Thumbs: _t }), e2.ref = n2.plugins.Thumbs, e2.option("showOnStart") || (e2.ref.state = Ft.Hidden, e2.hidden = true);
    }
    onResize() {
      var t2;
      const e2 = null === (t2 = this.ref) || void 0 === t2 ? void 0 : t2.container;
      e2 && (e2.style.maxHeight = "");
    }
    onKeydown(t2, e2) {
      const i2 = this.option("key");
      i2 && i2 === e2 && this.toggle();
    }
    toggle() {
      const t2 = this.ref;
      if (t2 && !t2.isDisabled())
        return t2.state === Ft.Hidden ? (t2.state = Ft.Init, void t2.build()) : void (this.hidden ? this.show() : this.hide());
    }
    show() {
      const t2 = this.ref;
      if (!t2 || t2.isDisabled())
        return;
      const e2 = t2.container;
      e2 && (this.refresh(), e2.offsetHeight, e2.removeAttribute(Xt), e2.classList.remove(Wt), this.hidden = false);
    }
    hide() {
      const t2 = this.ref, e2 = t2 && t2.container;
      e2 && (this.refresh(), e2.offsetHeight, e2.classList.add(Wt), e2.setAttribute(Xt, "true")), this.hidden = true;
    }
    refresh() {
      const t2 = this.ref;
      if (!t2 || !t2.state)
        return;
      const e2 = t2.container, i2 = (null == e2 ? void 0 : e2.firstChild) || null;
      e2 && i2 && i2.childNodes.length && (e2.style.maxHeight = `${i2.getBoundingClientRect().height}px`);
    }
    attach() {
      const t2 = this, e2 = t2.instance;
      e2.state === at.Init ? e2.on("Carousel.init", t2.onInit) : t2.onInit(), e2.on("resize", t2.onResize), e2.on("keydown", t2.onKeydown);
    }
    detach() {
      var t2;
      const e2 = this, i2 = e2.instance;
      i2.off("Carousel.init", e2.onInit), i2.off("resize", e2.onResize), i2.off("keydown", e2.onKeydown), null === (t2 = i2.carousel) || void 0 === t2 || t2.detachPlugins(["Thumbs"]), e2.ref = null;
    }
  };
  Object.defineProperty(qt, "defaults", { enumerable: true, configurable: true, writable: true, value: $t });
  var Yt = { panLeft: { icon: '<svg><path d="M5 12h14M5 12l6 6M5 12l6-6"/></svg>', change: { panX: -100 } }, panRight: { icon: '<svg><path d="M5 12h14M13 18l6-6M13 6l6 6"/></svg>', change: { panX: 100 } }, panUp: { icon: '<svg><path d="M12 5v14M18 11l-6-6M6 11l6-6"/></svg>', change: { panY: -100 } }, panDown: { icon: '<svg><path d="M12 5v14M18 13l-6 6M6 13l6 6"/></svg>', change: { panY: 100 } }, zoomIn: { icon: '<svg><circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/></svg>', action: "zoomIn" }, zoomOut: { icon: '<svg><circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.35-4.35M8 11h6"/></svg>', action: "zoomOut" }, toggle1to1: { icon: '<svg><path d="M3.51 3.07c5.74.02 11.48-.02 17.22.02 1.37.1 2.34 1.64 2.18 3.13 0 4.08.02 8.16 0 12.23-.1 1.54-1.47 2.64-2.79 2.46-5.61-.01-11.24.02-16.86-.01-1.36-.12-2.33-1.65-2.17-3.14 0-4.07-.02-8.16 0-12.23.1-1.36 1.22-2.48 2.42-2.46Z"/><path d="M5.65 8.54h1.49v6.92m8.94-6.92h1.49v6.92M11.5 9.4v.02m0 5.18v0"/></svg>', action: "toggleZoom" }, toggleZoom: { icon: '<svg><g><line x1="11" y1="8" x2="11" y2="14"></line></g><circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.35-4.35M8 11h6"/></svg>', action: "toggleZoom" }, iterateZoom: { icon: '<svg><g><line x1="11" y1="8" x2="11" y2="14"></line></g><circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.35-4.35M8 11h6"/></svg>', action: "iterateZoom" }, rotateCCW: { icon: '<svg><path d="M15 4.55a8 8 0 0 0-6 14.9M9 15v5H4M18.37 7.16v.01M13 19.94v.01M16.84 18.37v.01M19.37 15.1v.01M19.94 11v.01"/></svg>', action: "rotateCCW" }, rotateCW: { icon: '<svg><path d="M9 4.55a8 8 0 0 1 6 14.9M15 15v5h5M5.63 7.16v.01M4.06 11v.01M4.63 15.1v.01M7.16 18.37v.01M11 19.94v.01"/></svg>', action: "rotateCW" }, flipX: { icon: '<svg style="stroke-width: 1.3"><path d="M12 3v18M16 7v10h5L16 7M8 7v10H3L8 7"/></svg>', action: "flipX" }, flipY: { icon: '<svg style="stroke-width: 1.3"><path d="M3 12h18M7 16h10L7 21v-5M7 8h10L7 3v5"/></svg>', action: "flipY" }, fitX: { icon: '<svg><path d="M4 12V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6M10 18H3M21 18h-7M6 15l-3 3 3 3M18 15l3 3-3 3"/></svg>', action: "fitX" }, fitY: { icon: '<svg><path d="M12 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6M18 14v7M18 3v7M15 18l3 3 3-3M15 6l3-3 3 3"/></svg>', action: "fitY" }, reset: { icon: '<svg><path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/></svg>', action: "reset" }, toggleFS: { icon: '<svg><g><path d="M14.5 9.5 21 3m0 0h-6m6 0v6M3 21l6.5-6.5M3 21v-6m0 6h6"/></g><g><path d="m14 10 7-7m-7 7h6m-6 0V4M3 21l7-7m0 0v6m0-6H4"/></g></svg>', action: "toggleFS" } };
  var Vt;
  !function(t2) {
    t2[t2.Init = 0] = "Init", t2[t2.Ready = 1] = "Ready", t2[t2.Disabled = 2] = "Disabled";
  }(Vt || (Vt = {}));
  var Zt = { absolute: "auto", display: { left: ["infobar"], middle: [], right: ["iterateZoom", "slideshow", "fullscreen", "thumbs", "close"] }, enabled: "auto", items: { infobar: { tpl: '<div class="fancybox__infobar" tabindex="-1"><span data-fancybox-current-index></span>/<span data-fancybox-count></span></div>' }, download: { tpl: '<a class="f-button" title="{{DOWNLOAD}}" data-fancybox-download href="javasript:;"><svg><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12"/></svg></a>' }, prev: { tpl: '<button class="f-button" title="{{PREV}}" data-fancybox-prev><svg><path d="m15 6-6 6 6 6"/></svg></button>' }, next: { tpl: '<button class="f-button" title="{{NEXT}}" data-fancybox-next><svg><path d="m9 6 6 6-6 6"/></svg></button>' }, slideshow: { tpl: '<button class="f-button" title="{{TOGGLE_SLIDESHOW}}" data-fancybox-toggle-slideshow><svg><g><path d="M8 4v16l13 -8z"></path></g><g><path d="M8 4v15M17 4v15"/></g></svg></button>' }, fullscreen: { tpl: '<button class="f-button" title="{{TOGGLE_FULLSCREEN}}" data-fancybox-toggle-fullscreen><svg><g><path d="M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v2M16 20h2a2 2 0 0 0 2-2v-2"/></g><g><path d="M15 19v-2a2 2 0 0 1 2-2h2M15 5v2a2 2 0 0 0 2 2h2M5 15h2a2 2 0 0 1 2 2v2M5 9h2a2 2 0 0 0 2-2V5"/></g></svg></button>' }, thumbs: { tpl: '<button class="f-button" title="{{TOGGLE_THUMBS}}" data-fancybox-toggle-thumbs><svg><circle cx="5.5" cy="5.5" r="1"/><circle cx="12" cy="5.5" r="1"/><circle cx="18.5" cy="5.5" r="1"/><circle cx="5.5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18.5" cy="12" r="1"/><circle cx="5.5" cy="18.5" r="1"/><circle cx="12" cy="18.5" r="1"/><circle cx="18.5" cy="18.5" r="1"/></svg></button>' }, close: { tpl: '<button class="f-button" title="{{CLOSE}}" data-fancybox-close><svg><path d="m19.5 4.5-15 15M4.5 4.5l15 15"/></svg></button>' } }, parentEl: null };
  var Ut = { tabindex: "-1", width: "24", height: "24", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg" };
  var Gt = "has-toolbar";
  var Kt = "fancybox__toolbar";
  var Jt = class extends N {
    constructor() {
      super(...arguments), Object.defineProperty(this, "state", { enumerable: true, configurable: true, writable: true, value: Vt.Init }), Object.defineProperty(this, "container", { enumerable: true, configurable: true, writable: true, value: null });
    }
    onReady(t2) {
      var e2;
      if (!t2.carousel)
        return;
      let i2 = this.option("display"), n2 = this.option("absolute"), s2 = this.option("enabled");
      if ("auto" === s2) {
        const t3 = this.instance.carousel;
        let e3 = 0;
        if (t3)
          for (const i3 of t3.slides)
            (i3.panzoom || "image" === i3.type) && e3++;
        e3 || (s2 = false);
      }
      s2 || (i2 = void 0);
      let o2 = 0;
      const a2 = { left: [], middle: [], right: [] };
      if (i2)
        for (const t3 of ["left", "middle", "right"])
          for (const n3 of i2[t3]) {
            const i3 = this.createEl(n3);
            i3 && (null === (e2 = a2[t3]) || void 0 === e2 || e2.push(i3), o2++);
          }
      let r2 = null;
      if (o2 && (r2 = this.createContainer()), r2) {
        for (const [t3, e3] of Object.entries(a2)) {
          const i3 = document.createElement("div");
          P(i3, Kt + "__column is-" + t3);
          for (const t4 of e3)
            i3.appendChild(t4);
          "auto" !== n2 || "middle" !== t3 || e3.length || (n2 = true), r2.appendChild(i3);
        }
        true === n2 && P(r2, "is-absolute"), this.state = Vt.Ready, this.onRefresh();
      } else
        this.state = Vt.Disabled;
    }
    onClick(t2) {
      var e2, i2;
      const n2 = this.instance, s2 = n2.getSlide(), o2 = null == s2 ? void 0 : s2.panzoom, a2 = t2.target, r2 = a2 && E(a2) ? a2.dataset : null;
      if (!r2)
        return;
      if (void 0 !== r2.fancyboxToggleThumbs)
        return t2.preventDefault(), t2.stopPropagation(), void (null === (e2 = n2.plugins.Thumbs) || void 0 === e2 || e2.toggle());
      if (void 0 !== r2.fancyboxToggleFullscreen)
        return t2.preventDefault(), t2.stopPropagation(), void this.instance.toggleFullscreen();
      if (void 0 !== r2.fancyboxToggleSlideshow) {
        t2.preventDefault(), t2.stopPropagation();
        const e3 = null === (i2 = n2.carousel) || void 0 === i2 ? void 0 : i2.plugins.Autoplay;
        let s3 = e3.isActive;
        return o2 && "mousemove" === o2.panMode && !s3 && o2.reset(), void (s3 ? e3.stop() : e3.start());
      }
      const l2 = r2.panzoomAction, c2 = r2.panzoomChange;
      if ((c2 || l2) && (t2.preventDefault(), t2.stopPropagation()), c2) {
        let t3 = {};
        try {
          t3 = JSON.parse(c2);
        } catch (t4) {
        }
        o2 && o2.applyChange(t3);
      } else
        l2 && o2 && o2[l2] && o2[l2]();
    }
    onChange() {
      this.onRefresh();
    }
    onRefresh() {
      if (this.instance.isClosing())
        return;
      const t2 = this.container;
      if (!t2)
        return;
      const e2 = this.instance.getSlide();
      if (!e2 || e2.state !== rt.Ready)
        return;
      const i2 = e2 && !e2.error && e2.panzoom;
      for (const e3 of t2.querySelectorAll("[data-panzoom-action]"))
        i2 ? (e3.removeAttribute("disabled"), e3.removeAttribute("tabindex")) : (e3.setAttribute("disabled", ""), e3.setAttribute("tabindex", "-1"));
      let n2 = i2 && i2.canZoomIn(), s2 = i2 && i2.canZoomOut();
      for (const e3 of t2.querySelectorAll('[data-panzoom-action="zoomIn"]'))
        n2 ? (e3.removeAttribute("disabled"), e3.removeAttribute("tabindex")) : (e3.setAttribute("disabled", ""), e3.setAttribute("tabindex", "-1"));
      for (const e3 of t2.querySelectorAll('[data-panzoom-action="zoomOut"]'))
        s2 ? (e3.removeAttribute("disabled"), e3.removeAttribute("tabindex")) : (e3.setAttribute("disabled", ""), e3.setAttribute("tabindex", "-1"));
      for (const e3 of t2.querySelectorAll('[data-panzoom-action="toggleZoom"],[data-panzoom-action="iterateZoom"]')) {
        s2 || n2 ? (e3.removeAttribute("disabled"), e3.removeAttribute("tabindex")) : (e3.setAttribute("disabled", ""), e3.setAttribute("tabindex", "-1"));
        const t3 = e3.querySelector("g");
        t3 && (t3.style.display = n2 ? "" : "none");
      }
    }
    onDone(t2, e2) {
      var i2;
      null === (i2 = e2.panzoom) || void 0 === i2 || i2.on("afterTransform", () => {
        this.instance.isCurrentSlide(e2) && this.onRefresh();
      }), this.instance.isCurrentSlide(e2) && this.onRefresh();
    }
    createContainer() {
      const t2 = this.instance.container;
      if (!t2)
        return null;
      const e2 = this.option("parentEl") || t2;
      let i2 = e2.querySelector("." + Kt);
      return i2 || (i2 = document.createElement("div"), P(i2, Kt), e2.prepend(i2)), i2.addEventListener("click", this.onClick, { passive: false, capture: true }), t2 && P(t2, Gt), this.container = i2, i2;
    }
    createEl(t2) {
      const e2 = this.instance, i2 = e2.carousel;
      if (!i2)
        return null;
      if ("toggleFS" === t2)
        return null;
      if ("fullscreen" === t2 && !st())
        return null;
      let s2 = null;
      const o2 = i2.slides.length || 0;
      let a2 = 0, r2 = 0;
      for (const t3 of i2.slides)
        (t3.panzoom || "image" === t3.type) && a2++, ("image" === t3.type || t3.downloadSrc) && r2++;
      if (o2 < 2 && ["infobar", "prev", "next"].includes(t2))
        return s2;
      if (void 0 !== Yt[t2] && !a2)
        return null;
      if ("download" === t2 && !r2)
        return null;
      if ("thumbs" === t2) {
        const t3 = e2.plugins.Thumbs;
        if (!t3 || !t3.isEnabled)
          return null;
      }
      if ("slideshow" === t2) {
        if (!i2.plugins.Autoplay || o2 < 2)
          return null;
      }
      if (void 0 !== Yt[t2]) {
        const e3 = Yt[t2];
        s2 = document.createElement("button"), s2.setAttribute("title", this.instance.localize(`{{${t2.toUpperCase()}}}`)), P(s2, "f-button"), e3.action && (s2.dataset.panzoomAction = e3.action), e3.change && (s2.dataset.panzoomChange = JSON.stringify(e3.change)), s2.appendChild(n(this.instance.localize(e3.icon)));
      } else {
        const e3 = (this.option("items") || [])[t2];
        e3 && (s2 = n(this.instance.localize(e3.tpl)), "function" == typeof e3.click && s2.addEventListener("click", (t3) => {
          t3.preventDefault(), t3.stopPropagation(), "function" == typeof e3.click && e3.click.call(this, this, t3);
        }));
      }
      const l2 = null == s2 ? void 0 : s2.querySelector("svg");
      if (l2)
        for (const [t3, e3] of Object.entries(Ut))
          l2.getAttribute(t3) || l2.setAttribute(t3, String(e3));
      return s2;
    }
    removeContainer() {
      const t2 = this.container;
      t2 && t2.remove(), this.container = null, this.state = Vt.Disabled;
      const e2 = this.instance.container;
      e2 && S(e2, Gt);
    }
    attach() {
      const t2 = this, e2 = t2.instance;
      e2.on("Carousel.initSlides", t2.onReady), e2.on("done", t2.onDone), e2.on(["reveal", "Carousel.change"], t2.onChange), t2.onReady(t2.instance);
    }
    detach() {
      const t2 = this, e2 = t2.instance;
      e2.off("Carousel.initSlides", t2.onReady), e2.off("done", t2.onDone), e2.off(["reveal", "Carousel.change"], t2.onChange), t2.removeContainer();
    }
  };
  Object.defineProperty(Jt, "defaults", { enumerable: true, configurable: true, writable: true, value: Zt });
  var Qt = { Hash: class extends N {
    onReady() {
      ct = false;
    }
    onChange(t2) {
      dt && clearTimeout(dt);
      const { hash: e2 } = ut(), { hash: i2 } = pt(), n2 = t2.isOpeningSlide(t2.getSlide());
      n2 && (lt = i2 === e2 ? "" : i2), e2 && e2 !== i2 && (dt = setTimeout(() => {
        try {
          if (t2.state === at.Ready) {
            let t3 = "replaceState";
            n2 && !ht && (t3 = "pushState", ht = true), window.history[t3]({}, document.title, window.location.pathname + window.location.search + e2);
          }
        } catch (t3) {
        }
      }, 300));
    }
    onClose(t2) {
      if (dt && clearTimeout(dt), !ct && ht)
        return ht = false, ct = false, void window.history.back();
      if (!ct)
        try {
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search + (lt || ""));
        } catch (t3) {
        }
    }
    attach() {
      const t2 = this.instance;
      t2.on("ready", this.onReady), t2.on(["Carousel.ready", "Carousel.change"], this.onChange), t2.on("close", this.onClose);
    }
    detach() {
      const t2 = this.instance;
      t2.off("ready", this.onReady), t2.off(["Carousel.ready", "Carousel.change"], this.onChange), t2.off("close", this.onClose);
    }
    static parseURL() {
      return pt();
    }
    static startFromUrl() {
      ft();
    }
    static destroy() {
      window.removeEventListener("hashchange", mt, false);
    }
  }, Html: At, Images: yt, Slideshow: It, Thumbs: qt, Toolbar: Jt };
  var te = "with-fancybox";
  var ee = "hide-scrollbar";
  var ie = "--fancybox-scrollbar-compensate";
  var ne = "--fancybox-body-margin";
  var se = "aria-hidden";
  var oe = "is-using-tab";
  var ae = "is-animated";
  var re = "is-compact";
  var le = "is-loading";
  var ce = "is-opening";
  var he = "has-caption";
  var de = "disabled";
  var ue = "tabindex";
  var pe = "download";
  var fe = "href";
  var ge = "src";
  var me = (t2) => "string" == typeof t2;
  var ve = function() {
    var t2 = window.getSelection();
    return !!t2 && "Range" === t2.type;
  };
  var be;
  var ye = null;
  var we = null;
  var xe = 0;
  var Ee = 0;
  var Se = /* @__PURE__ */ new Map();
  var Pe = 0;
  var Ce = class _Ce extends g {
    get isIdle() {
      return this.idle;
    }
    get isCompact() {
      return this.option("compact");
    }
    constructor(t2 = [], e2 = {}, i2 = {}) {
      super(e2), Object.defineProperty(this, "userSlides", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "userPlugins", { enumerable: true, configurable: true, writable: true, value: {} }), Object.defineProperty(this, "idle", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "idleTimer", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "clickTimer", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "pwt", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "ignoreFocusChange", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "startedFs", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "state", { enumerable: true, configurable: true, writable: true, value: at.Init }), Object.defineProperty(this, "id", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "container", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "caption", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "footer", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "carousel", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "lastFocus", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "prevMouseMoveEvent", { enumerable: true, configurable: true, writable: true, value: void 0 }), be || (be = st()), this.id = e2.id || ++Pe, Se.set(this.id, this), this.userSlides = t2, this.userPlugins = i2, queueMicrotask(() => {
        this.init();
      });
    }
    init() {
      if (this.state === at.Destroy)
        return;
      this.state = at.Init, this.attachPlugins(Object.assign(Object.assign({}, _Ce.Plugins), this.userPlugins)), this.emit("init"), this.emit("attachPlugins"), true === this.option("hideScrollbar") && (() => {
        if (!tt)
          return;
        const t3 = document, e2 = t3.body, i2 = t3.documentElement;
        if (e2.classList.contains(ee))
          return;
        let n2 = window.innerWidth - i2.getBoundingClientRect().width;
        const s2 = parseFloat(window.getComputedStyle(e2).marginRight);
        n2 < 0 && (n2 = 0), i2.style.setProperty(ie, `${n2}px`), s2 && e2.style.setProperty(ne, `${s2}px`), e2.classList.add(ee);
      })(), this.initLayout(), this.scale();
      const t2 = () => {
        this.initCarousel(this.userSlides), this.state = at.Ready, this.attachEvents(), this.emit("ready"), setTimeout(() => {
          this.container && this.container.setAttribute(se, "false");
        }, 16);
      };
      this.option("Fullscreen.autoStart") && be && !be.isFullscreen() ? be.request().then(() => {
        this.startedFs = true, t2();
      }).catch(() => t2()) : t2();
    }
    initLayout() {
      var t2, e2;
      const i2 = this.option("parentEl") || document.body, s2 = n(this.localize(this.option("tpl.main") || ""));
      s2 && (s2.setAttribute("id", `fancybox-${this.id}`), s2.setAttribute("aria-label", this.localize("{{MODAL}}")), s2.classList.toggle(re, this.isCompact), P(s2, this.option("mainClass") || ""), P(s2, ce), this.container = s2, this.footer = s2.querySelector(".fancybox__footer"), i2.appendChild(s2), P(document.documentElement, te), ye && we || (ye = document.createElement("span"), P(ye, "fancybox-focus-guard"), ye.setAttribute(ue, "0"), ye.setAttribute(se, "true"), ye.setAttribute("aria-label", "Focus guard"), we = ye.cloneNode(), null === (t2 = s2.parentElement) || void 0 === t2 || t2.insertBefore(ye, s2), null === (e2 = s2.parentElement) || void 0 === e2 || e2.append(we)), s2.addEventListener("mousedown", (t3) => {
        xe = t3.pageX, Ee = t3.pageY, S(s2, oe);
      }), this.option("animated") && (P(s2, ae), setTimeout(() => {
        this.isClosing() || S(s2, ae);
      }, 350)), this.emit("initLayout"));
    }
    initCarousel(t2) {
      const i2 = this.container;
      if (!i2)
        return;
      const n2 = i2.querySelector(".fancybox__carousel");
      if (!n2)
        return;
      const s2 = this.carousel = new J(n2, u({}, { slides: t2, transition: "fade", Panzoom: { lockAxis: this.option("dragToClose") ? "xy" : "x", infinite: !!this.option("dragToClose") && "y" }, Dots: false, Navigation: { classes: { container: "fancybox__nav", button: "f-button", isNext: "is-next", isPrev: "is-prev" } }, initialPage: this.option("startIndex"), l10n: this.option("l10n") }, this.option("Carousel") || {}));
      s2.on("*", (t3, e2, ...i3) => {
        this.emit(`Carousel.${e2}`, t3, ...i3);
      }), s2.on(["ready", "change"], () => {
        this.manageCaption();
      }), this.on("Carousel.removeSlide", (t3, e2, i3) => {
        this.clearContent(i3), i3.state = void 0;
      }), s2.on("Panzoom.touchStart", () => {
        var t3, e2;
        this.isCompact || this.endIdle(), (null === (t3 = document.activeElement) || void 0 === t3 ? void 0 : t3.closest(".f-thumbs")) && (null === (e2 = this.container) || void 0 === e2 || e2.focus());
      }), s2.on("settle", () => {
        this.idleTimer || this.isCompact || !this.option("idle") || this.setIdle(), this.option("autoFocus") && !this.isClosing && this.checkFocus();
      }), this.option("dragToClose") && (s2.on("Panzoom.afterTransform", (t3, i3) => {
        const n3 = this.getSlide();
        if (n3 && e(n3.el))
          return;
        const s3 = this.container;
        if (s3) {
          const t4 = Math.abs(i3.current.f), e2 = t4 < 1 ? "" : Math.max(0.5, Math.min(1, 1 - t4 / i3.contentRect.fitHeight * 1.5));
          s3.style.setProperty("--fancybox-ts", e2 ? "0s" : ""), s3.style.setProperty("--fancybox-opacity", e2 + "");
        }
      }), s2.on("Panzoom.touchEnd", (t3, i3, n3) => {
        var s3;
        const o2 = this.getSlide();
        if (o2 && e(o2.el))
          return;
        if (i3.isMobile && document.activeElement && -1 !== ["TEXTAREA", "INPUT"].indexOf(null === (s3 = document.activeElement) || void 0 === s3 ? void 0 : s3.nodeName))
          return;
        const a2 = Math.abs(i3.dragOffset.y);
        "y" === i3.lockedAxis && (a2 >= 200 || a2 >= 50 && i3.dragOffset.time < 300) && (n3 && n3.cancelable && n3.preventDefault(), this.close(n3, "f-throwOut" + (i3.current.f < 0 ? "Up" : "Down")));
      })), s2.on("change", (t3) => {
        var e2;
        let i3 = null === (e2 = this.getSlide()) || void 0 === e2 ? void 0 : e2.triggerEl;
        if (i3) {
          const e3 = new CustomEvent("slideTo", { bubbles: true, cancelable: true, detail: t3.page });
          i3.dispatchEvent(e3);
        }
      }), s2.on(["refresh", "change"], (t3) => {
        const e2 = this.container;
        if (!e2)
          return;
        for (const i4 of e2.querySelectorAll("[data-fancybox-current-index]"))
          i4.innerHTML = t3.page + 1;
        for (const i4 of e2.querySelectorAll("[data-fancybox-count]"))
          i4.innerHTML = t3.pages.length;
        if (!t3.isInfinite) {
          for (const i4 of e2.querySelectorAll("[data-fancybox-next]"))
            t3.page < t3.pages.length - 1 ? (i4.removeAttribute(de), i4.removeAttribute(ue)) : (i4.setAttribute(de, ""), i4.setAttribute(ue, "-1"));
          for (const i4 of e2.querySelectorAll("[data-fancybox-prev]"))
            t3.page > 0 ? (i4.removeAttribute(de), i4.removeAttribute(ue)) : (i4.setAttribute(de, ""), i4.setAttribute(ue, "-1"));
        }
        const i3 = this.getSlide();
        if (!i3)
          return;
        let n3 = i3.downloadSrc || "";
        n3 || "image" !== i3.type || i3.error || !me(i3[ge]) || (n3 = i3[ge]);
        for (const t4 of e2.querySelectorAll("[data-fancybox-download]")) {
          const e3 = i3.downloadFilename;
          n3 ? (t4.removeAttribute(de), t4.removeAttribute(ue), t4.setAttribute(fe, n3), t4.setAttribute(pe, e3 || n3), t4.setAttribute("target", "_blank")) : (t4.setAttribute(de, ""), t4.setAttribute(ue, "-1"), t4.removeAttribute(fe), t4.removeAttribute(pe));
        }
      }), this.emit("initCarousel");
    }
    attachEvents() {
      const t2 = this, e2 = t2.container;
      if (!e2)
        return;
      e2.addEventListener("click", t2.onClick, { passive: false, capture: false }), e2.addEventListener("wheel", t2.onWheel, { passive: false, capture: false }), document.addEventListener("keydown", t2.onKeydown, { passive: false, capture: true }), document.addEventListener("visibilitychange", t2.onVisibilityChange, false), document.addEventListener("mousemove", t2.onMousemove), t2.option("trapFocus") && document.addEventListener("focus", t2.onFocus, true), window.addEventListener("resize", t2.onResize);
      const i2 = window.visualViewport;
      i2 && (i2.addEventListener("scroll", t2.onResize), i2.addEventListener("resize", t2.onResize));
    }
    detachEvents() {
      const t2 = this, e2 = t2.container;
      if (!e2)
        return;
      document.removeEventListener("keydown", t2.onKeydown, { passive: false, capture: true }), e2.removeEventListener("wheel", t2.onWheel, { passive: false, capture: false }), e2.removeEventListener("click", t2.onClick, { passive: false, capture: false }), document.removeEventListener("mousemove", t2.onMousemove), window.removeEventListener("resize", t2.onResize);
      const i2 = window.visualViewport;
      i2 && (i2.removeEventListener("resize", t2.onResize), i2.removeEventListener("scroll", t2.onResize)), document.removeEventListener("visibilitychange", t2.onVisibilityChange, false), document.removeEventListener("focus", t2.onFocus, true);
    }
    scale() {
      const t2 = this.container;
      if (!t2)
        return;
      const e2 = window.visualViewport, i2 = Math.max(1, (null == e2 ? void 0 : e2.scale) || 1);
      let n2 = "", s2 = "", o2 = "";
      if (e2 && i2 > 1) {
        let t3 = `${e2.offsetLeft}px`, a2 = `${e2.offsetTop}px`;
        n2 = e2.width * i2 + "px", s2 = e2.height * i2 + "px", o2 = `translate3d(${t3}, ${a2}, 0) scale(${1 / i2})`;
      }
      t2.style.transform = o2, t2.style.width = n2, t2.style.height = s2;
    }
    onClick(t2) {
      var e2;
      const { container: i2, isCompact: n2 } = this;
      if (!i2 || this.isClosing())
        return;
      !n2 && this.option("idle") && this.resetIdle();
      const s2 = t2.composedPath()[0];
      if (s2.closest(".fancybox-spinner") || s2.closest("[data-fancybox-close]"))
        return t2.preventDefault(), void this.close(t2);
      if (s2.closest("[data-fancybox-prev]"))
        return t2.preventDefault(), void this.prev();
      if (s2.closest("[data-fancybox-next]"))
        return t2.preventDefault(), void this.next();
      if ("click" === t2.type && 0 === t2.detail)
        return;
      if (Math.abs(t2.pageX - xe) > 30 || Math.abs(t2.pageY - Ee) > 30)
        return;
      const o2 = document.activeElement;
      if (ve() && o2 && i2.contains(o2))
        return;
      if (n2 && "image" === (null === (e2 = this.getSlide()) || void 0 === e2 ? void 0 : e2.type))
        return void (this.clickTimer ? (clearTimeout(this.clickTimer), this.clickTimer = null) : this.clickTimer = setTimeout(() => {
          this.toggleIdle(), this.clickTimer = null;
        }, 350));
      if (this.emit("click", t2), t2.defaultPrevented)
        return;
      let a2 = false;
      if (s2.closest(".fancybox__content")) {
        if (o2) {
          if (o2.closest("[contenteditable]"))
            return;
          s2.matches(it) || o2.blur();
        }
        if (ve())
          return;
        a2 = this.option("contentClick");
      } else
        s2.closest(".fancybox__carousel") && !s2.matches(it) && (a2 = this.option("backdropClick"));
      "close" === a2 ? (t2.preventDefault(), this.close(t2)) : "next" === a2 ? (t2.preventDefault(), this.next()) : "prev" === a2 && (t2.preventDefault(), this.prev());
    }
    onWheel(t2) {
      const e2 = t2.target;
      let n2 = this.option("wheel", t2);
      e2.closest(".fancybox__thumbs") && (n2 = "slide");
      const s2 = "slide" === n2, o2 = [-t2.deltaX || 0, -t2.deltaY || 0, -t2.detail || 0].reduce(function(t3, e3) {
        return Math.abs(e3) > Math.abs(t3) ? e3 : t3;
      }), a2 = Math.max(-1, Math.min(1, o2)), r2 = Date.now();
      this.pwt && r2 - this.pwt < 300 ? s2 && t2.preventDefault() : (this.pwt = r2, this.emit("wheel", t2, a2), t2.defaultPrevented || ("close" === n2 ? (t2.preventDefault(), this.close(t2)) : "slide" === n2 && (i(e2) || (t2.preventDefault(), this[a2 > 0 ? "prev" : "next"]()))));
    }
    onKeydown(t2) {
      if (!this.isTopmost())
        return;
      this.isCompact || !this.option("idle") || this.isClosing() || this.resetIdle();
      const e2 = t2.key, i2 = this.option("keyboard");
      if (!i2)
        return;
      const n2 = t2.composedPath()[0], s2 = document.activeElement && document.activeElement.classList, o2 = s2 && s2.contains("f-button") || n2.dataset.carouselPage || n2.dataset.carouselIndex;
      if ("Escape" !== e2 && !o2 && E(n2)) {
        if (n2.isContentEditable || -1 !== ["TEXTAREA", "OPTION", "INPUT", "SELECT", "VIDEO"].indexOf(n2.nodeName))
          return;
      }
      if ("Tab" === t2.key ? P(this.container, oe) : S(this.container, oe), t2.ctrlKey || t2.altKey || t2.shiftKey)
        return;
      this.emit("keydown", e2, t2);
      const a2 = i2[e2];
      a2 && "function" == typeof this[a2] && (t2.preventDefault(), this[a2]());
    }
    onResize() {
      const t2 = this.container;
      if (!t2)
        return;
      const e2 = this.isCompact;
      t2.classList.toggle(re, e2), this.manageCaption(this.getSlide()), this.isCompact ? this.clearIdle() : this.endIdle(), this.scale(), this.emit("resize");
    }
    onFocus(t2) {
      this.isTopmost() && this.checkFocus(t2);
    }
    onMousemove(t2) {
      this.prevMouseMoveEvent = t2, !this.isCompact && this.option("idle") && this.resetIdle();
    }
    onVisibilityChange() {
      "visible" === document.visibilityState ? this.checkFocus() : this.endIdle();
    }
    manageCloseBtn(t2) {
      const e2 = this.optionFor(t2, "closeButton") || false;
      if ("auto" === e2) {
        const t3 = this.plugins.Toolbar;
        if (t3 && t3.state === Vt.Ready)
          return;
      }
      if (!e2)
        return;
      if (!t2.contentEl || t2.closeBtnEl)
        return;
      const i2 = this.option("tpl.closeButton");
      if (i2) {
        const e3 = n(this.localize(i2));
        t2.closeBtnEl = t2.contentEl.appendChild(e3), t2.el && P(t2.el, "has-close-btn");
      }
    }
    manageCaption(t2 = void 0) {
      var e2, i2;
      const n2 = "fancybox__caption", s2 = this.container;
      if (!s2)
        return;
      S(s2, he);
      const o2 = this.isCompact || this.option("commonCaption"), a2 = !o2;
      if (this.caption && this.stop(this.caption), a2 && this.caption && (this.caption.remove(), this.caption = null), o2 && !this.caption)
        for (const t3 of (null === (e2 = this.carousel) || void 0 === e2 ? void 0 : e2.slides) || [])
          t3.captionEl && (t3.captionEl.remove(), t3.captionEl = void 0, S(t3.el, he), null === (i2 = t3.el) || void 0 === i2 || i2.removeAttribute("aria-labelledby"));
      if (t2 || (t2 = this.getSlide()), !t2 || o2 && !this.isCurrentSlide(t2))
        return;
      const r2 = t2.el;
      let l2 = this.optionFor(t2, "caption", "");
      if (!l2)
        return void (o2 && this.caption && this.animate(this.caption, "f-fadeOut", () => {
          this.caption && (this.caption.innerHTML = "");
        }));
      let c2 = null;
      if (a2) {
        if (c2 = t2.captionEl || null, r2 && !c2) {
          const e3 = n2 + `_${this.id}_${t2.index}`;
          c2 = document.createElement("div"), P(c2, n2), c2.setAttribute("id", e3), t2.captionEl = r2.appendChild(c2), P(r2, he), r2.setAttribute("aria-labelledby", e3);
        }
      } else {
        if (c2 = this.caption, c2 || (c2 = s2.querySelector("." + n2)), !c2) {
          c2 = document.createElement("div"), c2.dataset.fancyboxCaption = "", P(c2, n2);
          (this.footer || s2).prepend(c2);
        }
        P(s2, he), this.caption = c2;
      }
      c2 && (c2.innerHTML = "", me(l2) || "number" == typeof l2 ? c2.innerHTML = l2 + "" : l2 instanceof HTMLElement && c2.appendChild(l2));
    }
    checkFocus(t2) {
      this.focus(t2);
    }
    focus(t2) {
      var e2;
      if (this.ignoreFocusChange)
        return;
      const i2 = document.activeElement || null, n2 = (null == t2 ? void 0 : t2.target) || null, s2 = this.container, o2 = null === (e2 = this.carousel) || void 0 === e2 ? void 0 : e2.viewport;
      if (!s2 || !o2)
        return;
      if (!t2 && i2 && s2.contains(i2))
        return;
      const a2 = this.getSlide(), r2 = a2 && a2.state === rt.Ready ? a2.el : null;
      if (!r2 || r2.contains(i2) || s2 === i2)
        return;
      t2 && t2.cancelable && t2.preventDefault(), this.ignoreFocusChange = true;
      const l2 = Array.from(s2.querySelectorAll(it));
      let c2 = [], h2 = null;
      for (let t3 of l2) {
        const e3 = !t3.offsetParent || !!t3.closest('[aria-hidden="true"]'), i3 = r2 && r2.contains(t3), n3 = !o2.contains(t3);
        if (t3 === s2 || (i3 || n3) && !e3) {
          c2.push(t3);
          const e4 = t3.dataset.origTabindex;
          void 0 !== e4 && e4 && (t3.tabIndex = parseFloat(e4)), t3.removeAttribute("data-orig-tabindex"), !t3.hasAttribute("autoFocus") && h2 || (h2 = t3);
        } else {
          const e4 = void 0 === t3.dataset.origTabindex ? t3.getAttribute("tabindex") || "" : t3.dataset.origTabindex;
          e4 && (t3.dataset.origTabindex = e4), t3.tabIndex = -1;
        }
      }
      let d2 = null;
      t2 ? (!n2 || c2.indexOf(n2) < 0) && (d2 = h2 || s2, c2.length && (i2 === we ? d2 = c2[0] : this.lastFocus !== s2 && i2 !== ye || (d2 = c2[c2.length - 1]))) : d2 = a2 && "image" === a2.type ? s2 : h2 || s2, d2 && nt(d2), this.lastFocus = document.activeElement, this.ignoreFocusChange = false;
    }
    next() {
      const t2 = this.carousel;
      t2 && t2.pages.length > 1 && t2.slideNext();
    }
    prev() {
      const t2 = this.carousel;
      t2 && t2.pages.length > 1 && t2.slidePrev();
    }
    jumpTo(...t2) {
      this.carousel && this.carousel.slideTo(...t2);
    }
    isTopmost() {
      var t2;
      return (null === (t2 = _Ce.getInstance()) || void 0 === t2 ? void 0 : t2.id) == this.id;
    }
    animate(t2 = null, e2 = "", i2) {
      if (!t2 || !e2)
        return void (i2 && i2());
      this.stop(t2);
      const n2 = (s2) => {
        s2.target === t2 && t2.dataset.animationName && (t2.removeEventListener("animationend", n2), delete t2.dataset.animationName, i2 && i2(), S(t2, e2));
      };
      t2.dataset.animationName = e2, t2.addEventListener("animationend", n2), P(t2, e2);
    }
    stop(t2) {
      t2 && t2.dispatchEvent(new CustomEvent("animationend", { bubbles: false, cancelable: true, currentTarget: t2 }));
    }
    setContent(t2, e2 = "", i2 = true) {
      if (this.isClosing())
        return;
      const s2 = t2.el;
      if (!s2)
        return;
      let o2 = null;
      if (E(e2) ? o2 = e2 : (o2 = n(e2 + ""), E(o2) || (o2 = document.createElement("div"), o2.innerHTML = e2 + "")), ["img", "picture", "iframe", "video", "audio"].includes(o2.nodeName.toLowerCase())) {
        const t3 = document.createElement("div");
        t3.appendChild(o2), o2 = t3;
      }
      E(o2) && t2.filter && !t2.error && (o2 = o2.querySelector(t2.filter)), o2 && E(o2) ? (P(o2, "fancybox__content"), t2.id && o2.setAttribute("id", t2.id), "none" !== o2.style.display && "none" !== getComputedStyle(o2).getPropertyValue("display") || (o2.style.display = t2.display || this.option("defaultDisplay") || "flex"), s2.classList.add(`has-${t2.error ? "error" : t2.type || "unknown"}`), s2.prepend(o2), t2.contentEl = o2, i2 && this.revealContent(t2), this.manageCloseBtn(t2), this.manageCaption(t2)) : this.setError(t2, "{{ELEMENT_NOT_FOUND}}");
    }
    revealContent(t2, e2) {
      const i2 = t2.el, n2 = t2.contentEl;
      i2 && n2 && (this.emit("reveal", t2), this.hideLoading(t2), t2.state = rt.Opening, (e2 = this.isOpeningSlide(t2) ? void 0 === e2 ? this.optionFor(t2, "showClass") : e2 : "f-fadeIn") ? this.animate(n2, e2, () => {
        this.done(t2);
      }) : this.done(t2));
    }
    done(t2) {
      this.isClosing() || (t2.state = rt.Ready, this.emit("done", t2), P(t2.el, "is-done"), this.isCurrentSlide(t2) && this.option("autoFocus") && queueMicrotask(() => {
        var e2;
        null === (e2 = t2.panzoom) || void 0 === e2 || e2.updateControls(), this.option("autoFocus") && this.focus();
      }), this.isOpeningSlide(t2) && (S(this.container, ce), !this.isCompact && this.option("idle") && this.setIdle()));
    }
    isCurrentSlide(t2) {
      const e2 = this.getSlide();
      return !(!t2 || !e2) && e2.index === t2.index;
    }
    isOpeningSlide(t2) {
      var e2, i2;
      return null === (null === (e2 = this.carousel) || void 0 === e2 ? void 0 : e2.prevPage) && t2 && t2.index === (null === (i2 = this.getSlide()) || void 0 === i2 ? void 0 : i2.index);
    }
    showLoading(t2) {
      t2.state = rt.Loading;
      const e2 = t2.el;
      if (!e2)
        return;
      P(e2, le), this.emit("loading", t2), t2.spinnerEl || setTimeout(() => {
        if (!this.isClosing() && !t2.spinnerEl && t2.state === rt.Loading) {
          let i2 = n(x);
          P(i2, "fancybox-spinner"), t2.spinnerEl = i2, e2.prepend(i2), this.animate(i2, "f-fadeIn");
        }
      }, 250);
    }
    hideLoading(t2) {
      const e2 = t2.el;
      if (!e2)
        return;
      const i2 = t2.spinnerEl;
      this.isClosing() ? null == i2 || i2.remove() : (S(e2, le), i2 && this.animate(i2, "f-fadeOut", () => {
        i2.remove();
      }), t2.state === rt.Loading && (this.emit("loaded", t2), t2.state = rt.Ready));
    }
    setError(t2, e2) {
      if (this.isClosing())
        return;
      const i2 = new Event("error", { bubbles: true, cancelable: true });
      if (this.emit("error", i2, t2), i2.defaultPrevented)
        return;
      t2.error = e2, this.hideLoading(t2), this.clearContent(t2);
      const n2 = document.createElement("div");
      n2.classList.add("fancybox-error"), n2.innerHTML = this.localize(e2 || "<p>{{ERROR}}</p>"), this.setContent(t2, n2);
    }
    clearContent(t2) {
      if (void 0 === t2.state)
        return;
      this.emit("clearContent", t2), t2.contentEl && (t2.contentEl.remove(), t2.contentEl = void 0);
      const e2 = t2.el;
      e2 && (S(e2, "has-error"), S(e2, "has-unknown"), S(e2, `has-${t2.type || "unknown"}`)), t2.closeBtnEl && t2.closeBtnEl.remove(), t2.closeBtnEl = void 0, t2.captionEl && t2.captionEl.remove(), t2.captionEl = void 0, t2.spinnerEl && t2.spinnerEl.remove(), t2.spinnerEl = void 0;
    }
    getSlide() {
      var t2;
      const e2 = this.carousel;
      return (null === (t2 = null == e2 ? void 0 : e2.pages[null == e2 ? void 0 : e2.page]) || void 0 === t2 ? void 0 : t2.slides[0]) || void 0;
    }
    close(t2, e2) {
      if (this.isClosing())
        return;
      const i2 = new Event("shouldClose", { bubbles: true, cancelable: true });
      if (this.emit("shouldClose", i2, t2), i2.defaultPrevented)
        return;
      t2 && t2.cancelable && (t2.preventDefault(), t2.stopPropagation());
      const n2 = () => {
        this.proceedClose(t2, e2);
      };
      this.startedFs && be && be.isFullscreen() ? Promise.resolve(be.exit()).then(() => n2()) : n2();
    }
    clearIdle() {
      this.idleTimer && clearTimeout(this.idleTimer), this.idleTimer = null;
    }
    setIdle(t2 = false) {
      const e2 = () => {
        this.clearIdle(), this.idle = true, P(this.container, "is-idle"), this.emit("setIdle");
      };
      if (this.clearIdle(), !this.isClosing())
        if (t2)
          e2();
        else {
          const t3 = this.option("idle");
          t3 && (this.idleTimer = setTimeout(e2, t3));
        }
    }
    endIdle() {
      this.clearIdle(), this.idle && !this.isClosing() && (this.idle = false, S(this.container, "is-idle"), this.emit("endIdle"));
    }
    resetIdle() {
      this.endIdle(), this.setIdle();
    }
    toggleIdle() {
      this.idle ? this.endIdle() : this.setIdle(true);
    }
    toggleFullscreen() {
      be && (be.isFullscreen() ? be.exit() : be.request().then(() => {
        this.startedFs = true;
      }));
    }
    isClosing() {
      return [at.Closing, at.CustomClosing, at.Destroy].includes(this.state);
    }
    proceedClose(t2, e2) {
      var i2, n2;
      this.state = at.Closing, this.clearIdle(), this.detachEvents();
      const s2 = this.container, o2 = this.carousel, a2 = this.getSlide(), r2 = a2 && this.option("placeFocusBack") ? a2.triggerEl || this.option("triggerEl") : null;
      if (r2 && (Q(r2) ? nt(r2) : r2.focus()), s2 && (S(s2, ce), P(s2, "is-closing"), s2.setAttribute(se, "true"), this.option("animated") && P(s2, ae), s2.style.pointerEvents = "none"), o2) {
        o2.clearTransitions(), null === (i2 = o2.panzoom) || void 0 === i2 || i2.destroy(), null === (n2 = o2.plugins.Navigation) || void 0 === n2 || n2.detach();
        for (const t3 of o2.slides) {
          t3.state = rt.Closing, this.hideLoading(t3);
          const e3 = t3.contentEl;
          e3 && this.stop(e3);
          const i3 = null == t3 ? void 0 : t3.panzoom;
          i3 && (i3.stop(), i3.detachEvents(), i3.detachObserver()), this.isCurrentSlide(t3) || o2.emit("removeSlide", t3);
        }
      }
      this.emit("close", t2), this.state !== at.CustomClosing ? (void 0 === e2 && a2 && (e2 = this.optionFor(a2, "hideClass")), e2 && a2 ? (this.animate(a2.contentEl, e2, () => {
        o2 && o2.emit("removeSlide", a2);
      }), setTimeout(() => {
        this.destroy();
      }, 500)) : this.destroy()) : setTimeout(() => {
        this.destroy();
      }, 500);
    }
    destroy() {
      var t2;
      if (this.state === at.Destroy)
        return;
      this.state = at.Destroy, null === (t2 = this.carousel) || void 0 === t2 || t2.destroy();
      const e2 = this.container;
      e2 && e2.remove(), Se.delete(this.id);
      const i2 = _Ce.getInstance();
      i2 ? i2.focus() : (ye && (ye.remove(), ye = null), we && (we.remove(), we = null), S(document.documentElement, te), (() => {
        if (!tt)
          return;
        const t3 = document, e3 = t3.body;
        e3.classList.remove(ee), e3.style.setProperty(ne, ""), t3.documentElement.style.setProperty(ie, "");
      })(), this.emit("destroy"));
    }
    static bind(t2, e2, i2) {
      if (!tt)
        return;
      let n2, s2 = "", o2 = {};
      if (void 0 === t2 ? n2 = document.body : me(t2) ? (n2 = document.body, s2 = t2, "object" == typeof e2 && (o2 = e2 || {})) : (n2 = t2, me(e2) && (s2 = e2), "object" == typeof i2 && (o2 = i2 || {})), !n2 || !E(n2))
        return;
      s2 = s2 || "[data-fancybox]";
      const a2 = _Ce.openers.get(n2) || /* @__PURE__ */ new Map();
      a2.set(s2, o2), _Ce.openers.set(n2, a2), 1 === a2.size && n2.addEventListener("click", _Ce.fromEvent);
    }
    static unbind(t2, e2) {
      let i2, n2 = "";
      if (me(t2) ? (i2 = document.body, n2 = t2) : (i2 = t2, me(e2) && (n2 = e2)), !i2)
        return;
      const s2 = _Ce.openers.get(i2);
      s2 && n2 && s2.delete(n2), n2 && s2 || (_Ce.openers.delete(i2), i2.removeEventListener("click", _Ce.fromEvent));
    }
    static destroy() {
      let t2;
      for (; t2 = _Ce.getInstance(); )
        t2.destroy();
      for (const t3 of _Ce.openers.keys())
        t3.removeEventListener("click", _Ce.fromEvent);
      _Ce.openers = /* @__PURE__ */ new Map();
    }
    static fromEvent(t2) {
      if (t2.defaultPrevented)
        return;
      if (t2.button && 0 !== t2.button)
        return;
      if (t2.ctrlKey || t2.metaKey || t2.shiftKey)
        return;
      let e2 = t2.composedPath()[0];
      const i2 = e2.closest("[data-fancybox-trigger]");
      if (i2) {
        const t3 = i2.dataset.fancyboxTrigger || "", n3 = document.querySelectorAll(`[data-fancybox="${t3}"]`), s3 = parseInt(i2.dataset.fancyboxIndex || "", 10) || 0;
        e2 = n3[s3] || e2;
      }
      if (!(e2 && e2 instanceof Element))
        return;
      let n2, s2, o2, a2;
      if ([..._Ce.openers].reverse().find(([t3, i3]) => !(!t3.contains(e2) || ![...i3].reverse().find(([i4, r3]) => {
        let l3 = e2.closest(i4);
        return !!l3 && (n2 = t3, s2 = i4, o2 = l3, a2 = r3, true);
      }))), !n2 || !s2 || !o2)
        return;
      a2 = a2 || {}, t2.preventDefault(), e2 = o2;
      let r2 = [], l2 = u({}, ot, a2);
      l2.event = t2, l2.triggerEl = e2, l2.delegate = i2;
      const c2 = l2.groupAll, h2 = l2.groupAttr, d2 = h2 && e2 ? e2.getAttribute(`${h2}`) : "";
      if ((!e2 || d2 || c2) && (r2 = [].slice.call(n2.querySelectorAll(s2))), e2 && !c2 && (r2 = d2 ? r2.filter((t3) => t3.getAttribute(`${h2}`) === d2) : [e2]), !r2.length)
        return;
      const p2 = _Ce.getInstance();
      return p2 && p2.options.triggerEl && r2.indexOf(p2.options.triggerEl) > -1 ? void 0 : (e2 && (l2.startIndex = r2.indexOf(e2)), _Ce.fromNodes(r2, l2));
    }
    static fromSelector(t2, e2, i2) {
      let n2 = null, s2 = "", o2 = {};
      if (me(t2) ? (n2 = document.body, s2 = t2, "object" == typeof e2 && (o2 = e2 || {})) : t2 instanceof HTMLElement && me(e2) && (n2 = t2, s2 = e2, "object" == typeof i2 && (o2 = i2 || {})), !n2 || !s2)
        return false;
      const a2 = _Ce.openers.get(n2);
      return !!a2 && (o2 = u({}, a2.get(s2) || {}, o2), !!o2 && _Ce.fromNodes(Array.from(n2.querySelectorAll(s2)), o2));
    }
    static fromNodes(t2, e2) {
      e2 = u({}, ot, e2 || {});
      const i2 = [];
      for (const n2 of t2) {
        const t3 = n2.dataset || {}, s2 = t3[ge] || n2.getAttribute(fe) || n2.getAttribute("currentSrc") || n2.getAttribute(ge) || void 0;
        let o2;
        const a2 = e2.delegate;
        let r2;
        a2 && i2.length === e2.startIndex && (o2 = a2 instanceof HTMLImageElement ? a2 : a2.querySelector("img:not([aria-hidden])")), o2 || (o2 = n2 instanceof HTMLImageElement ? n2 : n2.querySelector("img:not([aria-hidden])")), o2 && (r2 = o2.currentSrc || o2[ge] || void 0, !r2 && o2.dataset && (r2 = o2.dataset.lazySrc || o2.dataset[ge] || void 0));
        const l2 = { src: s2, triggerEl: n2, thumbEl: o2, thumbElSrc: r2, thumbSrc: r2 };
        for (const e3 in t3) {
          let i3 = t3[e3] + "";
          i3 = "false" !== i3 && ("true" === i3 || i3), l2[e3] = i3;
        }
        i2.push(l2);
      }
      return new _Ce(i2, e2);
    }
    static getInstance(t2) {
      if (t2)
        return Se.get(t2);
      return Array.from(Se.values()).reverse().find((t3) => !t3.isClosing() && t3) || null;
    }
    static getSlide() {
      var t2;
      return (null === (t2 = _Ce.getInstance()) || void 0 === t2 ? void 0 : t2.getSlide()) || null;
    }
    static show(t2 = [], e2 = {}) {
      return new _Ce(t2, e2);
    }
    static next() {
      const t2 = _Ce.getInstance();
      t2 && t2.next();
    }
    static prev() {
      const t2 = _Ce.getInstance();
      t2 && t2.prev();
    }
    static close(t2 = true, ...e2) {
      if (t2)
        for (const t3 of Se.values())
          t3.close(...e2);
      else {
        const t3 = _Ce.getInstance();
        t3 && t3.close(...e2);
      }
    }
  };
  Object.defineProperty(Ce, "version", { enumerable: true, configurable: true, writable: true, value: "5.0.33" }), Object.defineProperty(Ce, "defaults", { enumerable: true, configurable: true, writable: true, value: ot }), Object.defineProperty(Ce, "Plugins", { enumerable: true, configurable: true, writable: true, value: Qt }), Object.defineProperty(Ce, "openers", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() });

  // app/javascript/application.js
  document.addEventListener("DOMContentLoaded", function() {
    Ce.bind("[data-fancybox]");
  });
})();
/*! Bundled license information:

bootstrap/dist/js/bootstrap.js:
  (*!
    * Bootstrap v5.3.3 (https://getbootstrap.com/)
    * Copyright 2011-2024 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
    * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
    *)

@hotwired/turbo/dist/turbo.es2017-esm.js:
  (*!
  Turbo 8.0.3
  Copyright © 2024 37signals LLC
   *)
*/
//# sourceMappingURL=/assets/application.js.map
