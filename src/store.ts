import { StorageLike } from "@vueuse/core";

const GMStorage: StorageLike = {
  getItem(key) {
    return GM_getValue(key);
  },
  setItem(key, value) {
    GM_setValue(key, value);
  },
  removeItem(key) {
    GM_deleteValue(key);
  },
};

const user = useStorage("user", "", GMStorage);
const password = useStorage("password", "", GMStorage);
const serverUrl = useStorage("serverUrl", "", GMStorage);
const basicAuthUser = useStorage("basicAuthUser", "", GMStorage);
const basicAuthPassword = useStorage("basicAuthPassword", "", GMStorage);

export { user, password, serverUrl, basicAuthPassword, basicAuthUser };
