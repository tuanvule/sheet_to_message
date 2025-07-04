import { RenderFormRequest } from "./script/renderFormRequest.js";

const renderHandler = new RenderFormRequest();
await renderHandler.init();
renderHandler.render();
console.log(renderHandler.getAll());
