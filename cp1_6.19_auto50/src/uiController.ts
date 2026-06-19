import { BuildingRegion } from "./photoProcessor";

interface UIControllerCallbacks {
    onFileSelect: (file: File) => void;
    onViewChange: (view: string) => void;
    onOpacityChange: (value: number) => void;
    onMaterialChange: (material: string) => void;
    onAmbientChange: (value: number) => void;
    onResetView: () => void;
    onBuildingClick: (buildingId: string) => void;
}

export class UIController {
    private callbacks: UIControllerCallbacks;
    private uploadOverlay: HTMLElement | null;
    private uploadButton: HTMLElement | null;
    private fileInput: HTMLInputElement | null;
    private loadingIndicator: HTMLElement | null;
    private viewPresetButtons: HTMLElement | null;
    private controlPanel: HTMLElement | null;
    private infoPanel: HTMLElement | null;
    private mobileAccordion: HTMLElement | null;
    private opacitySlider: HTMLInputElement | null;
    private opacityValue: HTMLElement | null;
    private ambientSlider: HTMLInputElement | null;
    private ambientValue: HTMLElement | null;
    private resetViewBtn: HTMLElement | null;
    private closeInfoBtn: HTMLElement | null;
    private accordionHeader: HTMLElement | null;
    private accordionContent: HTMLElement | null;
    private mobileOpacitySlider: HTMLInputElement | null;
    private mobileAmbientSlider: HTMLInputElement | null;

    constructor(callbacks: UIControllerCallbacks) {
        this.callbacks = callbacks;
        this.uploadOverlay = document.getElementById("upload-overlay");
        this.uploadButton = document.getElementById("upload-button");
        this.fileInput = document.getElementById("file-input") as HTMLInputElement;
        this.loadingIndicator = document.getElementById("loading-indicator");
        this.viewPresetButtons = document.getElementById("view-preset-buttons");
        this.controlPanel = document.getElementById("control-panel");
        this.infoPanel = document.getElementById("info-panel");
        this.mobileAccordion = document.getElementById("mobile-accordion");
        this.opacitySlider = document.getElementById("opacity-slider") as HTMLInputElement;
        this.opacityValue = document.getElementById("opacity-value");
        this.ambientSlider = document.getElementById("ambient-slider") as HTMLInputElement;
        this.ambientValue = document.getElementById("ambient-value");
        this.resetViewBtn = document.getElementById("reset-view-btn");
        this.closeInfoBtn = document.getElementById("close-info-btn");
        this.accordionHeader = document.querySelector(".accordion-header");
        this.accordionContent = document.querySelector(".accordion-content");
        this.mobileOpacitySlider = document.getElementById("mobile-opacity-slider") as HTMLInputElement;
        this.mobileAmbientSlider = document.getElementById("mobile-ambient-slider") as HTMLInputElement;
        this.bindEvents();
    }

    private bindEvents(): void {
        this.uploadButton?.addEventListener("click", () => {
            this.fileInput?.click();
        });
        this.fileInput?.addEventListener("change", (e) => {
            const target = e.target as HTMLInputElement;
            if (target.files && target.files[0]) {
                this.callbacks.onFileSelect(target.files[0]);
            }
        });
        this.viewPresetButtons?.querySelectorAll(".view-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const view = btn.getAttribute("data-view");
                if (view) {
                    this.callbacks.onViewChange(view);
                }
            });
        });
        this.opacitySlider?.addEventListener("input", (e) => {
            const value = parseFloat((e.target as HTMLInputElement).value);
            this.callbacks.onOpacityChange(value);
            if (this.mobileOpacitySlider) {
                this.mobileOpacitySlider.value = value.toString();
            }
        });
        this.mobileOpacitySlider?.addEventListener("input", (e) => {
            const value = parseFloat((e.target as HTMLInputElement).value);
            this.callbacks.onOpacityChange(value);
            if (this.opacitySlider) {
                this.opacitySlider.value = value.toString();
            }
        });
        document.querySelectorAll(".material-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const material = btn.getAttribute("data-material");
                if (material) {
                    this.callbacks.onMaterialChange(material);
                }
            });
        });
        this.ambientSlider?.addEventListener("input", (e) => {
            const value = parseFloat((e.target as HTMLInputElement).value);
            this.callbacks.onAmbientChange(value);
            if (this.mobileAmbientSlider) {
                this.mobileAmbientSlider.value = value.toString();
            }
        });
        this.mobileAmbientSlider?.addEventListener("input", (e) => {
            const value = parseFloat((e.target as HTMLInputElement).value);
            this.callbacks.onAmbientChange(value);
            if (this.ambientSlider) {
                this.ambientSlider.value = value.toString();
            }
        });
        this.resetViewBtn?.addEventListener("click", () => {
            this.callbacks.onResetView();
        });
        this.closeInfoBtn?.addEventListener("click", () => {
            this.hideInfoPanel();
        });
        this.accordionHeader?.addEventListener("click", () => {
            this.accordionHeader?.classList.toggle("active");
            this.accordionContent?.classList.toggle("open");
        });
        const canvas = document.getElementById("three-canvas");
        if (canvas) {
            canvas.addEventListener("click", (e) => {
                if (e.target === canvas) {
                    this.hideInfoPanel();
                }
            });
        }
    }

    public showUploadOverlay(show: boolean): void {
        if (this.uploadOverlay) {
            this.uploadOverlay.classList.toggle("hidden", !show);
        }
    }

    public showLoading(show: boolean): void {
        if (this.loadingIndicator) {
            this.loadingIndicator.classList.toggle("hidden", !show);
        }
    }

    public showControls(show: boolean): void {
        if (this.viewPresetButtons) {
            this.viewPresetButtons.classList.toggle("hidden", !show);
        }
        if (this.controlPanel) {
            this.controlPanel.classList.toggle("hidden", !show);
        }
        if (this.mobileAccordion) {
            this.mobileAccordion.classList.toggle("hidden", !show);
        }
    }

    public showInfoPanel(building: BuildingRegion): void {
        if (!this.infoPanel) return;
        const thumbnail = document.getElementById("building-thumbnail") as HTMLImageElement;
        const hueValue = document.getElementById("hue-value");
        const brightnessValue = document.getElementById("brightness-value");
        const colorSample = document.getElementById("color-sample");
        if (thumbnail) {
            thumbnail.src = building.thumbnail.toDataURL();
        }
        if (hueValue) {
            hueValue.textContent = `${Math.round(building.hue)}°`;
        }
        if (brightnessValue) {
            brightnessValue.textContent = `${Math.round(building.brightness * 100)}