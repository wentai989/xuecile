import { Video } from "bilibili-api-ts/video.js";

const v = new Video({ bvid: "BV1GJ411x7h7" });

v.get_info({}).then(info => {
    console.log("cid:", info.cid);
}).catch(console.error);
