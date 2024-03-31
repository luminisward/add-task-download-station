// ==UserScript==
// @name       add-task-download-station
// @namespace  https://github.com/luminisward
// @version    0.0.1
// @author     luminisward
// @match      *://*/*
// @require    https://cdn.jsdelivr.net/npm/vue@3.4.21/dist/vue.global.prod.js
// @grant      GM_deleteValue
// @grant      GM_getValue
// @grant      GM_registerMenuCommand
// @grant      GM_setValue
// @grant      GM_xmlhttpRequest
// ==/UserScript==

(function (vue) {
  'use strict';

  var _GM_deleteValue = /* @__PURE__ */ (() => typeof GM_deleteValue != "undefined" ? GM_deleteValue : void 0)();
  var _GM_getValue = /* @__PURE__ */ (() => typeof GM_getValue != "undefined" ? GM_getValue : void 0)();
  var _GM_registerMenuCommand = /* @__PURE__ */ (() => typeof GM_registerMenuCommand != "undefined" ? GM_registerMenuCommand : void 0)();
  var _GM_setValue = /* @__PURE__ */ (() => typeof GM_setValue != "undefined" ? GM_setValue : void 0)();
  var _GM_xmlhttpRequest = /* @__PURE__ */ (() => typeof GM_xmlhttpRequest != "undefined" ? GM_xmlhttpRequest : void 0)();
  function tryOnScopeDispose(fn) {
    if (vue.getCurrentScope()) {
      vue.onScopeDispose(fn);
      return true;
    }
    return false;
  }
  function toValue(r) {
    return typeof r === "function" ? r() : vue.unref(r);
  }
  const isClient = typeof window !== "undefined" && typeof document !== "undefined";
  typeof WorkerGlobalScope !== "undefined" && globalThis instanceof WorkerGlobalScope;
  const toString = Object.prototype.toString;
  const isObject = (val) => toString.call(val) === "[object Object]";
  const noop = () => {
  };
  function createFilterWrapper(filter, fn) {
    function wrapper(...args) {
      return new Promise((resolve, reject) => {
        Promise.resolve(filter(() => fn.apply(this, args), { fn, thisArg: this, args })).then(resolve).catch(reject);
      });
    }
    return wrapper;
  }
  const bypassFilter = (invoke2) => {
    return invoke2();
  };
  function pausableFilter(extendFilter = bypassFilter) {
    const isActive = vue.ref(true);
    function pause() {
      isActive.value = false;
    }
    function resume() {
      isActive.value = true;
    }
    const eventFilter = (...args) => {
      if (isActive.value)
        extendFilter(...args);
    };
    return { isActive: vue.readonly(isActive), pause, resume, eventFilter };
  }
  function getLifeCycleTarget(target) {
    return target || vue.getCurrentInstance();
  }
  function watchWithFilter(source, cb, options = {}) {
    const {
      eventFilter = bypassFilter,
      ...watchOptions
    } = options;
    return vue.watch(
      source,
      createFilterWrapper(
        eventFilter,
        cb
      ),
      watchOptions
    );
  }
  function watchPausable(source, cb, options = {}) {
    const {
      eventFilter: filter,
      ...watchOptions
    } = options;
    const { eventFilter, pause, resume, isActive } = pausableFilter(filter);
    const stop = watchWithFilter(
      source,
      cb,
      {
        ...watchOptions,
        eventFilter
      }
    );
    return { stop, pause, resume, isActive };
  }
  function tryOnMounted(fn, sync = true, target) {
    const instance = getLifeCycleTarget();
    if (instance)
      vue.onMounted(fn, target);
    else if (sync)
      fn();
    else
      vue.nextTick(fn);
  }
  function unrefElement(elRef) {
    var _a;
    const plain = toValue(elRef);
    return (_a = plain == null ? void 0 : plain.$el) != null ? _a : plain;
  }
  const defaultWindow = isClient ? window : void 0;
  function useEventListener(...args) {
    let target;
    let events2;
    let listeners;
    let options;
    if (typeof args[0] === "string" || Array.isArray(args[0])) {
      [events2, listeners, options] = args;
      target = defaultWindow;
    } else {
      [target, events2, listeners, options] = args;
    }
    if (!target)
      return noop;
    if (!Array.isArray(events2))
      events2 = [events2];
    if (!Array.isArray(listeners))
      listeners = [listeners];
    const cleanups = [];
    const cleanup = () => {
      cleanups.forEach((fn) => fn());
      cleanups.length = 0;
    };
    const register = (el, event, listener, options2) => {
      el.addEventListener(event, listener, options2);
      return () => el.removeEventListener(event, listener, options2);
    };
    const stopWatch = vue.watch(
      () => [unrefElement(target), toValue(options)],
      ([el, options2]) => {
        cleanup();
        if (!el)
          return;
        const optionsClone = isObject(options2) ? { ...options2 } : options2;
        cleanups.push(
          ...events2.flatMap((event) => {
            return listeners.map((listener) => register(el, event, listener, optionsClone));
          })
        );
      },
      { immediate: true, flush: "post" }
    );
    const stop = () => {
      stopWatch();
      cleanup();
    };
    tryOnScopeDispose(stop);
    return stop;
  }
  const _global = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
  const globalKey = "__vueuse_ssr_handlers__";
  const handlers = /* @__PURE__ */ getHandlers();
  function getHandlers() {
    if (!(globalKey in _global))
      _global[globalKey] = _global[globalKey] || {};
    return _global[globalKey];
  }
  function getSSRHandler(key, fallback) {
    return handlers[key] || fallback;
  }
  function guessSerializerType(rawInit) {
    return rawInit == null ? "any" : rawInit instanceof Set ? "set" : rawInit instanceof Map ? "map" : rawInit instanceof Date ? "date" : typeof rawInit === "boolean" ? "boolean" : typeof rawInit === "string" ? "string" : typeof rawInit === "object" ? "object" : !Number.isNaN(rawInit) ? "number" : "any";
  }
  const StorageSerializers = {
    boolean: {
      read: (v) => v === "true",
      write: (v) => String(v)
    },
    object: {
      read: (v) => JSON.parse(v),
      write: (v) => JSON.stringify(v)
    },
    number: {
      read: (v) => Number.parseFloat(v),
      write: (v) => String(v)
    },
    any: {
      read: (v) => v,
      write: (v) => String(v)
    },
    string: {
      read: (v) => v,
      write: (v) => String(v)
    },
    map: {
      read: (v) => new Map(JSON.parse(v)),
      write: (v) => JSON.stringify(Array.from(v.entries()))
    },
    set: {
      read: (v) => new Set(JSON.parse(v)),
      write: (v) => JSON.stringify(Array.from(v))
    },
    date: {
      read: (v) => new Date(v),
      write: (v) => v.toISOString()
    }
  };
  const customStorageEventName = "vueuse-storage";
  function useStorage(key, defaults2, storage, options = {}) {
    var _a;
    const {
      flush = "pre",
      deep = true,
      listenToStorageChanges = true,
      writeDefaults = true,
      mergeDefaults = false,
      shallow,
      window: window2 = defaultWindow,
      eventFilter,
      onError = (e) => {
        console.error(e);
      },
      initOnMounted
    } = options;
    const data = (shallow ? vue.shallowRef : vue.ref)(typeof defaults2 === "function" ? defaults2() : defaults2);
    if (!storage) {
      try {
        storage = getSSRHandler("getDefaultStorage", () => {
          var _a2;
          return (_a2 = defaultWindow) == null ? void 0 : _a2.localStorage;
        })();
      } catch (e) {
        onError(e);
      }
    }
    if (!storage)
      return data;
    const rawInit = toValue(defaults2);
    const type = guessSerializerType(rawInit);
    const serializer = (_a = options.serializer) != null ? _a : StorageSerializers[type];
    const { pause: pauseWatch, resume: resumeWatch } = watchPausable(
      data,
      () => write(data.value),
      { flush, deep, eventFilter }
    );
    if (window2 && listenToStorageChanges) {
      tryOnMounted(() => {
        useEventListener(window2, "storage", update);
        useEventListener(window2, customStorageEventName, updateFromCustomEvent);
        if (initOnMounted)
          update();
      });
    }
    if (!initOnMounted)
      update();
    function dispatchWriteEvent(oldValue, newValue) {
      if (window2) {
        window2.dispatchEvent(new CustomEvent(customStorageEventName, {
          detail: {
            key,
            oldValue,
            newValue,
            storageArea: storage
          }
        }));
      }
    }
    function write(v) {
      try {
        const oldValue = storage.getItem(key);
        if (v == null) {
          dispatchWriteEvent(oldValue, null);
          storage.removeItem(key);
        } else {
          const serialized = serializer.write(v);
          if (oldValue !== serialized) {
            storage.setItem(key, serialized);
            dispatchWriteEvent(oldValue, serialized);
          }
        }
      } catch (e) {
        onError(e);
      }
    }
    function read(event) {
      const rawValue = event ? event.newValue : storage.getItem(key);
      if (rawValue == null) {
        if (writeDefaults && rawInit != null)
          storage.setItem(key, serializer.write(rawInit));
        return rawInit;
      } else if (!event && mergeDefaults) {
        const value = serializer.read(rawValue);
        if (typeof mergeDefaults === "function")
          return mergeDefaults(value, rawInit);
        else if (type === "object" && !Array.isArray(value))
          return { ...rawInit, ...value };
        return value;
      } else if (typeof rawValue !== "string") {
        return rawValue;
      } else {
        return serializer.read(rawValue);
      }
    }
    function update(event) {
      if (event && event.storageArea !== storage)
        return;
      if (event && event.key == null) {
        data.value = rawInit;
        return;
      }
      if (event && event.key !== key)
        return;
      pauseWatch();
      try {
        if ((event == null ? void 0 : event.newValue) !== serializer.write(data.value))
          data.value = read(event);
      } catch (e) {
        onError(e);
      } finally {
        if (event)
          vue.nextTick(resumeWatch);
        else
          resumeWatch();
      }
    }
    function updateFromCustomEvent(event) {
      update(event.detail);
    }
    return data;
  }
  const GMStorage = {
    getItem(key) {
      return _GM_getValue(key);
    },
    setItem(key, value) {
      _GM_setValue(key, value);
    },
    removeItem(key) {
      _GM_deleteValue(key);
    }
  };
  const user = useStorage("user", "", GMStorage);
  const password = useStorage("password", "", GMStorage);
  const serverUrl = useStorage("serverUrl", "", GMStorage);
  const _hoisted_1 = /* @__PURE__ */ vue.createElementVNode("h1", null, "Settings", -1);
  const _hoisted_2 = { action: "" };
  const _hoisted_3 = /* @__PURE__ */ vue.createElementVNode("label", { for: "user" }, "User", -1);
  const _hoisted_4 = /* @__PURE__ */ vue.createElementVNode("label", { for: "email" }, "Password", -1);
  const _hoisted_5 = /* @__PURE__ */ vue.createElementVNode("label", { for: "url" }, "Server Url", -1);
  const _sfc_main = /* @__PURE__ */ vue.defineComponent({
    __name: "SettingsDialog",
    setup(__props) {
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("div", null, [
          _hoisted_1,
          vue.createElementVNode("form", _hoisted_2, [
            _hoisted_3,
            vue.withDirectives(vue.createElementVNode("input", {
              id: "user",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => vue.isRef(user) ? user.value = $event : null),
              type: "text"
            }, null, 512), [
              [vue.vModelText, vue.unref(user)]
            ]),
            _hoisted_4,
            vue.withDirectives(vue.createElementVNode("input", {
              id: "password",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => vue.isRef(password) ? password.value = $event : null),
              type: "password"
            }, null, 512), [
              [vue.vModelText, vue.unref(password)]
            ]),
            _hoisted_5,
            vue.withDirectives(vue.createElementVNode("input", {
              id: "url",
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => vue.isRef(serverUrl) ? serverUrl.value = $event : null),
              type: "text"
            }, null, 512), [
              [vue.vModelText, vue.unref(serverUrl)]
            ])
          ])
        ]);
      };
    }
  });
  let sidCache = null;
  const getSid = async () => {
    if (sidCache === null) {
      sidCache = new Promise((resolve, reject) => {
        const data = new URLSearchParams(
          Object.entries({ user: vue.unref(user), pwd: btoa(vue.unref(password)) })
        );
        _GM_xmlhttpRequest({
          method: "POST",
          url: serverUrl.value + "/cgi-bin/authLogin.cgi",
          data,
          user: vue.unref(user),
          password: password.value,
          onload: (response) => {
            var _a;
            const sidNode = (_a = response.responseXML) == null ? void 0 : _a.getElementsByTagName("authSid")[0];
            const sid = sidNode == null ? void 0 : sidNode.textContent;
            if (sid) {
              resolve(sid);
            } else {
              reject(response);
            }
          },
          onerror: (response) => {
            reject(response);
          }
        });
      });
    }
    return sidCache;
  };
  const addUrl = async (url) => {
    const sid = await getSid();
    new Promise((resolve, reject) => {
      _GM_xmlhttpRequest({
        method: "POST",
        url: serverUrl.value + "/downloadstation/V4/Task/AddUrl",
        user: user.value,
        password: password.value,
        data: new URLSearchParams(
          Object.entries({
            temp: "Download",
            move: "Complete",
            url,
            sid
          })
        ),
        onload: (response) => {
          resolve(JSON.parse(response.responseText));
        },
        onerror: (response) => {
          reject(response);
        }
      });
    });
  };
  let clickedEl = null;
  document.addEventListener("contextmenu", function(event) {
    clickedEl = event.target;
  });
  _GM_registerMenuCommand("add task", async () => {
    if (clickedEl) {
      console.log(`the clicked element is :`);
      console.log(clickedEl);
      if (clickedEl instanceof HTMLElement) {
        let element = clickedEl;
        while (element && !(element instanceof HTMLAnchorElement) && element.parentElement) {
          element = element.parentElement;
        }
        if (element instanceof HTMLAnchorElement) {
          console.log(element.href);
          addUrl(element.href);
        } else {
          console.log("no link found");
        }
      } else {
        throw new Error("clickedEl is not a HTMLElement");
      }
      clickedEl = null;
    }
  });
  _GM_registerMenuCommand("Settings", () => {
    vue.createApp(_sfc_main).mount(
      (() => {
        const app = document.createElement("div");
        document.body.append(app);
        return app;
      })()
    );
  });

})(Vue);