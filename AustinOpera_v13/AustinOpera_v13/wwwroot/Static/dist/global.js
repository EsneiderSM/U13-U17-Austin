/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./Static/javascript/global/helpers/cookie.ts":
/*!****************************************************!*\
  !*** ./Static/javascript/global/helpers/cookie.ts ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, exports) {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.expireCookie = exports.setCookie = exports.getCookie = void 0;\r\nfunction getCookie(name) {\r\n    var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');\r\n    return v ? v[2] : null;\r\n}\r\nexports.getCookie = getCookie;\r\nfunction setCookie(name, value, days, domain) {\r\n    if (domain === void 0) { domain = ''; }\r\n    var d = new Date;\r\n    d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);\r\n    var newCookie = name + \"=\" + value + \";path=/;expires=\" + d.toUTCString() + \";\" + (domain ? \";domain=\" + domain : '');\r\n    document.cookie = newCookie;\r\n}\r\nexports.setCookie = setCookie;\r\nfunction expireCookie(name) {\r\n    document.cookie = name + \"=; expires=Thu, 01 Jan 1970 00:00:00 UTC;\";\r\n}\r\nexports.expireCookie = expireCookie;\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9TdGF0aWMvamF2YXNjcmlwdC9nbG9iYWwvaGVscGVycy9jb29raWUudHMiLCJtYXBwaW5ncyI6Ijs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUtBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTEE7QUFPQTtBQUNBO0FBQ0E7QUFGQSIsInNvdXJjZXMiOlsid2VicGFjazovL2FkYWdlLmZlZC5zdGFydGVyLy4vU3RhdGljL2phdmFzY3JpcHQvZ2xvYmFsL2hlbHBlcnMvY29va2llLnRzPzBhYmUiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGdldENvb2tpZShuYW1lOiBzdHJpbmcpIHtcclxuICAgIHZhciB2ID0gZG9jdW1lbnQuY29va2llLm1hdGNoKCcoXnw7KSA/JyArIG5hbWUgKyAnPShbXjtdKikoO3wkKScpO1xyXG4gICAgcmV0dXJuIHYgPyB2WzJdIDogbnVsbDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldENvb2tpZShuYW1lOiBzdHJpbmcsIHZhbHVlOiBib29sZWFuIHwgc3RyaW5nLCBkYXlzOiBudW1iZXIsIGRvbWFpbiA9ICcnKSB7XHJcbiAgICB2YXIgZCA9IG5ldyBEYXRlO1xyXG4gICAgZC5zZXRUaW1lKGQuZ2V0VGltZSgpICsgMjQgKiA2MCAqIDYwICogMTAwMCAqIGRheXMpO1xyXG4gICAgY29uc3QgbmV3Q29va2llID0gYCR7bmFtZX09JHt2YWx1ZX07cGF0aD0vO2V4cGlyZXM9JHtkLnRvVVRDU3RyaW5nKCl9O2AgKyAoZG9tYWluID8gYDtkb21haW49JHtkb21haW59YCA6ICcnKTtcclxuICAgIGRvY3VtZW50LmNvb2tpZSA9IG5ld0Nvb2tpZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGV4cGlyZUNvb2tpZShuYW1lOiBzdHJpbmcpIHtcclxuICAgIGRvY3VtZW50LmNvb2tpZSA9IGAke25hbWV9PTsgZXhwaXJlcz1UaHUsIDAxIEphbiAxOTcwIDAwOjAwOjAwIFVUQztgO1xyXG59Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./Static/javascript/global/helpers/cookie.ts\n");

/***/ }),

/***/ "./Static/javascript/global/index.ts":
/*!*******************************************!*\
  !*** ./Static/javascript/global/index.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nvar google_translate_1 = __webpack_require__(/*! ./modules/google-translate */ \"./Static/javascript/global/modules/google-translate.ts\");\r\ngoogle_translate_1.googleTranslateInit();\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9TdGF0aWMvamF2YXNjcmlwdC9nbG9iYWwvaW5kZXgudHMiLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUdBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYWRhZ2UuZmVkLnN0YXJ0ZXIvLi9TdGF0aWMvamF2YXNjcmlwdC9nbG9iYWwvaW5kZXgudHM/ZjdhZSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnb29nbGVUcmFuc2xhdGVJbml0IH0gZnJvbSAnLi9tb2R1bGVzL2dvb2dsZS10cmFuc2xhdGUnO1xyXG5cclxuXHJcbmdvb2dsZVRyYW5zbGF0ZUluaXQoKTtcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./Static/javascript/global/index.ts\n");

/***/ }),

/***/ "./Static/javascript/global/modules/google-translate.ts":
/*!**************************************************************!*\
  !*** ./Static/javascript/global/modules/google-translate.ts ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.googleTranslateInit = void 0;\r\nvar cookie_1 = __webpack_require__(/*! ../helpers/cookie */ \"./Static/javascript/global/helpers/cookie.ts\");\r\nvar cookieName = 'googtrans22';\r\nfunction googleTranslateInit() {\r\n    var _a;\r\n    var cookieValue = (_a = document.cookie\r\n        .split('; ')\r\n        .find(function (row) { return row.startsWith(cookieName); })) === null || _a === void 0 ? void 0 : _a.split('=')[1].split(\"/\");\r\n    console.log('cookie value = ');\r\n    console.log(cookieValue);\r\n    if (cookieValue) {\r\n        var splitValue_1 = cookieValue[cookieValue.length - 1];\r\n        var select_1 = document.querySelector('[data-translate-select]');\r\n        var items = document.querySelectorAll('[data-translate-select] option');\r\n        items.forEach(function (item) {\r\n            if (item.value == splitValue_1) {\r\n                select_1.value = item.value;\r\n            }\r\n        });\r\n    }\r\n    function onLanguageChange(e) {\r\n        var select = e.target;\r\n        var selectedLanguage = (select === null || select === void 0 ? void 0 : select.value) || 'en';\r\n        if (selectedLanguage === 'en') {\r\n            cookie_1.expireCookie(cookieName);\r\n        }\r\n        else {\r\n            cookie_1.setCookie(cookieName, \"/en/\" + selectedLanguage, .5);\r\n        }\r\n        location.reload();\r\n    }\r\n    var translateSelect = document.querySelector('[data-translate-select]');\r\n    if (translateSelect) {\r\n        translateSelect.addEventListener('change', onLanguageChange);\r\n    }\r\n}\r\nexports.googleTranslateInit = googleTranslateInit;\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9TdGF0aWMvamF2YXNjcmlwdC9nbG9iYWwvbW9kdWxlcy9nb29nbGUtdHJhbnNsYXRlLnRzIiwibWFwcGluZ3MiOiI7OztBQUFBO0FBRUE7QUFFQTs7QUFHQTtBQUNBO0FBQ0E7QUFHQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUVBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXhDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2FkYWdlLmZlZC5zdGFydGVyLy4vU3RhdGljL2phdmFzY3JpcHQvZ2xvYmFsL21vZHVsZXMvZ29vZ2xlLXRyYW5zbGF0ZS50cz8xMjYwIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGV4cGlyZUNvb2tpZSwgc2V0Q29va2llIH0gZnJvbSBcIi4uL2hlbHBlcnMvY29va2llXCI7XHJcblxyXG5jb25zdCBjb29raWVOYW1lID0gJ2dvb2d0cmFuczIyJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnb29nbGVUcmFuc2xhdGVJbml0KCkge1xyXG5cclxuXHJcbiAgICBjb25zdCBjb29raWVWYWx1ZSA9IGRvY3VtZW50LmNvb2tpZVxyXG4gICAgICAgIC5zcGxpdCgnOyAnKVxyXG4gICAgICAgIC5maW5kKChyb3cpID0+IHJvdy5zdGFydHNXaXRoKGNvb2tpZU5hbWUpKVxyXG4gICAgICAgID8uc3BsaXQoJz0nKVsxXS5zcGxpdChcIi9cIik7XHJcblxyXG4gICAgY29uc29sZS5sb2coJ2Nvb2tpZSB2YWx1ZSA9ICcpO1xyXG4gICAgY29uc29sZS5sb2coY29va2llVmFsdWUpO1xyXG5cclxuICAgIGlmIChjb29raWVWYWx1ZSkge1xyXG4gICAgICAgIGxldCBzcGxpdFZhbHVlID0gY29va2llVmFsdWVbY29va2llVmFsdWUubGVuZ3RoIC0gMV1cclxuICAgICAgICBjb25zdCBzZWxlY3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS10cmFuc2xhdGUtc2VsZWN0XScpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICAgICAgY29uc3QgaXRlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS10cmFuc2xhdGUtc2VsZWN0XSBvcHRpb24nKTtcclxuICAgICAgICBpdGVtcy5mb3JFYWNoKChpdGVtOiBIVE1MSW5wdXRFbGVtZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLnZhbHVlID09IHNwbGl0VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHNlbGVjdC52YWx1ZSA9IGl0ZW0udmFsdWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gb25MYW5ndWFnZUNoYW5nZShlKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3Qgc2VsZWN0ID0gZS50YXJnZXQgYXMgSFRNTFNlbGVjdEVsZW1lbnQ7XHJcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRMYW5ndWFnZSA9IHNlbGVjdD8udmFsdWUgfHwgJ2VuJztcclxuXHJcbiAgICAgICAgaWYgKHNlbGVjdGVkTGFuZ3VhZ2UgPT09ICdlbicpIHtcclxuICAgICAgICAgICAgZXhwaXJlQ29va2llKGNvb2tpZU5hbWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNldENvb2tpZShjb29raWVOYW1lLCBgL2VuLyR7c2VsZWN0ZWRMYW5ndWFnZX1gLCAuNSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0cmFuc2xhdGVTZWxlY3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS10cmFuc2xhdGUtc2VsZWN0XScpO1xyXG4gICAgaWYgKHRyYW5zbGF0ZVNlbGVjdCkge1xyXG4gICAgICAgIHRyYW5zbGF0ZVNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBvbkxhbmd1YWdlQ2hhbmdlKTtcclxuICAgIH1cclxufSJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./Static/javascript/global/modules/google-translate.ts\n");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./Static/javascript/global/index.ts");
/******/ 	
/******/ })()
;