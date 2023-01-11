import {setEditMode} from "../util/setEditMode";
import {lineNumberRender} from "../markdown/highlightRender";
import {scrollEvent} from "../scroll/event";
import {isMobile} from "../../util/functions";
import {Constants} from "../../constants";
import {hasClosestByAttribute, hasClosestByClassName} from "../util/hasClosest";

export const initUI = (protyle: IProtyle) => {
    protyle.contentElement = document.createElement("div");
    protyle.contentElement.className = "protyle-content";
    if (window.siyuan.config.editor.fullWidth) {
        protyle.contentElement.setAttribute("data-fullwidth", "true");
    } else {
        protyle.contentElement.removeAttribute("data-fullwidth");
    }
    if (protyle.options.render.background) {
        protyle.contentElement.appendChild(protyle.background.element);
    }
    if (protyle.options.render.title) {
        protyle.contentElement.appendChild(protyle.title.element);
    }
    protyle.contentElement.appendChild(protyle.wysiwyg.element);
    if (!protyle.options.action.includes(Constants.CB_GET_HISTORY)) {
        scrollEvent(protyle, protyle.contentElement);
    }
    protyle.element.append(protyle.contentElement);
    protyle.element.appendChild(protyle.preview.element);
    if (protyle.upload) {
        protyle.element.appendChild(protyle.upload.element);
    }
    if (protyle.options.render.scroll) {
        protyle.element.appendChild(protyle.scroll.element.parentElement);
    }
    if (protyle.gutter) {
        protyle.element.appendChild(protyle.gutter.element);
    }

    protyle.element.appendChild(protyle.hint.element);

    protyle.selectElement = document.createElement("div");
    protyle.selectElement.className = "protyle-select fn__none";
    protyle.element.appendChild(protyle.selectElement);

    protyle.element.appendChild(protyle.toolbar.element);
    protyle.element.appendChild(protyle.toolbar.subElement);

    addLoading(protyle);

    setEditMode(protyle, protyle.options.mode);
    document.execCommand("DefaultParagraphSeparator", false, "p");

    // 触摸屏背景和嵌入块按钮显示
    protyle.contentElement.addEventListener("touchstart", (event) => {
        // https://github.com/siyuan-note/siyuan/issues/6328
        if (protyle.disabled) {
            return;
        }
        const target = event.target as HTMLElement;
        if (hasClosestByClassName(target, "protyle-icons") ||
            hasClosestByClassName(target, "item") ||
            target.classList.contains("protyle-background__icon")) {
            return;
        }
        if (hasClosestByClassName(target, "protyle-background")) {
            protyle.background.element.classList.toggle("protyle-background--mobileshow");
            return;
        }
        const embedBlockElement = hasClosestByAttribute(target, "data-type", "NodeBlockQueryEmbed");
        if (embedBlockElement) {
            embedBlockElement.firstElementChild.classList.toggle("protyle-icons--show");
        }
    });
};

export const addLoading = (protyle: IProtyle) => {
    protyle.element.insertAdjacentHTML("beforeend", '<div style="background-color: var(--b3-theme-background)" class="fn__loading wysiwygLoading"><img width="48px" src="/stage/loading-pure.svg"></div>');
};

export const removeLoading = (protyle: IProtyle) => {
    const loadingElement = protyle.element.querySelector(".wysiwygLoading");
    if (loadingElement) {
        loadingElement.remove();
    }
};

export const setPadding = (protyle: IProtyle) => {
    if (protyle.options.action.includes(Constants.CB_GET_HISTORY)) {
        return;
    }
    let min16 = 16;
    let min24 = 24;
    if (!isMobile()) {
        let padding = (protyle.element.clientWidth - Constants.SIZE_EDITOR_WIDTH) / 2;
        if (!window.siyuan.config.editor.fullWidth && padding > 96) {
            if (padding > Constants.SIZE_EDITOR_WIDTH) {
                // 超宽屏调整 https://ld246.com/article/1668266637363
                padding = protyle.element.clientWidth * .382 / 1.382;
            }
            min16 = padding;
            min24 = padding;
        } else if (protyle.element.clientWidth > Constants.SIZE_EDITOR_WIDTH) {
            min16 = 96;
            min24 = 96;
        }
    }
    if (protyle.options.render.background && protyle.options.render.title) {
        protyle.background.element.lastElementChild.setAttribute("style", `left:${min16}px`);
        protyle.title.element.style.margin = `16px ${min16}px 0 ${min24}px`;
    } else if (protyle.options.render.background && !protyle.options.render.title) {
        protyle.background.element.lastElementChild.setAttribute("style", `left:${min16}px`);
    } else if (!protyle.options.render.background && protyle.options.render.title) {
        protyle.title.element.style.margin = `16px ${min16}px 0 ${min24}px`;
    }
    let bottomHeight = "16px";
    if (protyle.options.typewriterMode) {
        if (isMobile()) {
            bottomHeight = window.innerHeight / 5 + "px";
        } else {
            bottomHeight = protyle.element.clientHeight / 2 + "px";
        }
    }
    if (protyle.options.backlinkData) {
        protyle.wysiwyg.element.style.padding = `4px ${min16}px 4px ${min24}px`;
    } else {
        protyle.wysiwyg.element.style.padding = `16px ${min16}px ${bottomHeight} ${min24}px`;
    }
    protyle.wysiwyg.element.style.transition = ""; // addWnd 时防止向右分屏，左侧文档抖动，移除动画
    if (window.siyuan.config.editor.codeSyntaxHighlightLineNum) {
        setTimeout(() => { // https://github.com/siyuan-note/siyuan/issues/5612
            protyle.wysiwyg.element.querySelectorAll('.code-block [contenteditable="true"]').forEach((block: HTMLElement) => {
                lineNumberRender(block);
            });
        }, 300);
    }
    if (window.siyuan.config.editor.displayBookmarkIcon) {
        const editorAttrElement = document.getElementById("editorAttr");
        if (editorAttrElement) {
            editorAttrElement.innerHTML = `.protyle-wysiwyg--attr .b3-tooltips:after { max-width: ${protyle.wysiwyg.element.clientWidth - min16 - min24}px; }`;
        }
    }
};