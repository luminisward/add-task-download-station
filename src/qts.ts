import { user, password, serverUrl } from "./store";

let sidCache: Promise<string> | null = null;
const getSid = async () => {
  if (sidCache === null) {
    sidCache = new Promise<string>((resolve, reject) => {
      const data = new URLSearchParams(
        Object.entries({ user: unref(user), pwd: btoa(unref(password)) }),
      );
      GM_xmlhttpRequest({
        method: "POST",
        url: serverUrl.value + "/cgi-bin/authLogin.cgi",
        data,
        user: unref(user),
        password: password.value,
        onload: (response) => {
          const sidNode =
            response.responseXML?.getElementsByTagName("authSid")[0];
          const sid = sidNode?.textContent;
          if (sid) {
            resolve(sid);
          } else {
            reject(response);
          }
        },
        onerror: (response) => {
          reject(response);
        },
      });
    });
  }
  return sidCache;
};

const queryTask = async () => {
  const sid = await getSid();
  const data = new URLSearchParams(
    Object.entries({
      from: "0",
      limit: "50",
      type: "all",
      status: "all",
      sid,
    }),
  );

  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "POST",
      url: serverUrl.value + "/downloadstation/V4/Task/Query",
      data,
      user: user.value,
      password: password.value,
      onload: (response) => {
        resolve(JSON.parse(response.responseText));
      },
      onerror: (response) => {
        reject(response);
      },
    });
  });
};

const addUrl = async (url: string) => {
  const sid = await getSid();
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "POST",
      url: serverUrl.value + "/downloadstation/V4/Task/AddUrl",
      user: user.value,
      password: password.value,
      data: new URLSearchParams(
        Object.entries({
          temp: "Download",
          move: "Complete",
          url,
          sid,
        }),
      ),
      onload: (response) => {
        resolve(JSON.parse(response.responseText));
      },
      onerror: (response) => {
        reject(response);
      },
    });
  });
};

export { getSid, queryTask, addUrl };
