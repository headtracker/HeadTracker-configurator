/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import { Platform } from '@angular/cdk/platform';
import {
  AfterViewInit, ANIMATION_MODULE_TYPE,
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  inject,
  Input,
  NgZone,
  numberAttribute,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import {
  _TriSlider,
  _TriSliderRangeThumb,
  _TriSliderThumb,
  _TriSliderVisualThumb,
  _TriThumb,
  TRI_SLIDER,
  TRI_SLIDER_RANGE_THUMB,
  TRI_SLIDER_THUMB,
  TRI_SLIDER_VISUAL_THUMB,
} from './slider-interface';
import { TriSliderVisualThumb } from './slider-thumb';
import { MAT_RIPPLE_GLOBAL_OPTIONS, RippleGlobalOptions } from '@angular/material/core';

// TODO(wagnermaciel): maybe handle the following edge case:
// 1. start dragging discrete slider
// 2. tab to disable checkbox
// 3. without ending drag, disable the slider

/**
 * Allows users to select from a range of values by moving the slider thumb. It is similar in
 * behavior to the native `<input type="range">` element.
 */
@Component({
  selector: 'tri-slider',
  templateUrl: 'slider.html',
  host: {
    class: 'mat-mdc-slider mdc-slider class.mdc-slider--range mat-primary',
    '[class.mdc-slider--disabled]': 'disabled',
    '[class.mdc-slider--discrete]': 'discrete',
  },
  exportAs: 'triSlider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: TRI_SLIDER, useExisting: TriSlider }],
  imports: [TriSliderVisualThumb],
  standalone: true,
})
export class TriSlider implements AfterViewInit, OnDestroy, _TriSlider {
  readonly _ngZone = inject(NgZone);
  readonly _cdr = inject(ChangeDetectorRef);
  readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly _globalRippleOptions = inject<RippleGlobalOptions>(MAT_RIPPLE_GLOBAL_OPTIONS, {
    optional: true,
  });

  /** The active portion of the slider track. */
  @ViewChild('trackActive') _trackActive!: ElementRef<HTMLElement>;

  /** The slider thumb(s). */
  @ViewChildren(TRI_SLIDER_VISUAL_THUMB) _thumbs!: QueryList<_TriSliderVisualThumb>;

  /** The sliders hidden range input(s). */
  @ContentChild(TRI_SLIDER_THUMB) _input!: _TriSliderThumb;

  /** The sliders hidden range input(s). */
  @ContentChildren(TRI_SLIDER_RANGE_THUMB, { descendants: false })
  _inputs!: QueryList<_TriSliderRangeThumb>;

  /** Whether the slider is disabled. */
  @Input({ transform: booleanAttribute })
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(v: boolean) {
    this._disabled = v;
    const endInput = this._getInput(_TriThumb.END);
    const startInput = this._getInput(_TriThumb.START);
    const midInput = this._getInput(_TriThumb.MID);

    if (endInput) {
      endInput.disabled = this._disabled;
    }
    if (startInput) {
      startInput.disabled = this._disabled;
    }
    if (midInput) {
      midInput.disabled = this._disabled;
    }
  }

  private _disabled: boolean = false;

  /** Whether the slider displays a numeric value label upon pressing the thumb. */
  @Input({ transform: booleanAttribute })
  get discrete(): boolean {
    return this._discrete;
  }

  set discrete(v: boolean) {
    this._discrete = v;
    this._updateValueIndicatorUIs();
  }

  private _discrete: boolean = false;

  /** The minimum value that the slider can have. */
  @Input({ transform: numberAttribute })
  get min(): number {
    return this._min;
  }

  set min(v: number) {
    const min = v === undefined || v === null || isNaN(v) ? this._min : v;
    if (this._min !== min) {
      this._updateMin(min);
    }
  }

  private _min: number = 0;

  private _updateMin(min: number): void {
    const prevMin = this._min;
    this._min = min;
    this._isRange ? this._updateMinRange({ old: prevMin, new: min }) : null;
    this._onMinMaxOrStepChange();
  }

  private _updateMinRange(min: { old: number; new: number }): void {
    const endInput = this._getInput(_TriThumb.END) as _TriSliderRangeThumb;
    const midInput = this._getInput(_TriThumb.MID) as _TriSliderRangeThumb;
    const startInput = this._getInput(_TriThumb.START) as _TriSliderRangeThumb;

    const oldEndValue = endInput.value;
    const oldMidValue = midInput.value;
    const oldStartValue = startInput.value;

    startInput.min = min.new;
    endInput.min = Math.max(min.new, startInput.value);
    midInput.min = Math.max(min.new, midInput.value);
    startInput.max = Math.min(endInput.max, endInput.value);

    startInput._updateWidthInactive();
    midInput._updateWidthInactive();
    endInput._updateWidthInactive();
    //// siin jäi poolei
    min.new < min.old
      ? this._onTranslateXChangeBySideEffect(endInput, startInput, midInput)
      : this._onTranslateXChangeBySideEffect(startInput, endInput, midInput);

    if (oldEndValue !== endInput.value) {
      this._onValueChange(endInput);
    }

    if (oldMidValue !== midInput.value) {
      this._onValueChange(midInput);
    }

    if (oldStartValue !== startInput.value) {
      this._onValueChange(startInput);
    }
  }

  /** The maximum value that the slider can have. */
  @Input({ transform: numberAttribute })
  get max(): number {
    return this._max;
  }

  set max(v: number) {
    const max = v === undefined || v === null || isNaN(v) ? this._max : v;
    if (this._max !== max) {
      this._updateMax(max);
    }
  }

  private _max: number = 100;

  private _updateMax(max: number): void {
    const prevMax = this._max;
    this._max = max;
    this._isRange ? this._updateMaxRange({ old: prevMax, new: max }) : null;
    this._onMinMaxOrStepChange();
  }

  private _updateMaxRange(max: { old: number; new: number }): void {
    const endInput = this._getInput(_TriThumb.END) as _TriSliderRangeThumb;
    const midInput = this._getInput(_TriThumb.MID) as _TriSliderRangeThumb;
    const startInput = this._getInput(_TriThumb.START) as _TriSliderRangeThumb;

    const oldEndValue = endInput.value;
    const oldMidValue = midInput.value;
    const oldStartValue = startInput.value;

    endInput.max = max.new;
    startInput.max = Math.min(max.new, endInput.value);
    midInput.max = Math.min(max.new, midInput.value);
    endInput.min = startInput.value;

    endInput._updateWidthInactive();
    startInput._updateWidthInactive();

    max.new > max.old
      ? this._onTranslateXChangeBySideEffect(startInput, endInput, midInput)
      : this._onTranslateXChangeBySideEffect(endInput, startInput, midInput);

    if (oldEndValue !== endInput.value) {
      this._onValueChange(endInput);
    }

    if (oldMidValue !== midInput.value) {
      this._onValueChange(midInput);
    }

    if (oldStartValue !== startInput.value) {
      this._onValueChange(startInput);
    }
  }

  /** The values at which the thumb will snap. */
  @Input({ transform: numberAttribute })
  get step(): number {
    return this._step;
  }

  set step(v: number) {
    const step = isNaN(v) ? this._step : v;
    if (this._step !== step) {
      this._updateStep(step);
    }
  }

  private _step: number = 1;

  private _updateStep(step: number): void {
    this._step = step;
    this._isRange ? this._updateStepRange() : null;
    this._onMinMaxOrStepChange();
  }

  private _updateStepRange(): void {
    const endInput = this._getInput(_TriThumb.END) as _TriSliderRangeThumb;
    const startInput = this._getInput(_TriThumb.START) as _TriSliderRangeThumb;
    const midInput = this._getInput(_TriThumb.MID) as _TriSliderRangeThumb;

    const oldEndValue = endInput.value;
    const oldStartValue = startInput.value;
    const oldMidValue = midInput.value;

    const prevStartValue = startInput.value;

    endInput.min = this._min;
    startInput.max = this._max;

    endInput.step = this._step;
    midInput.step = this._step;
    startInput.step = this._step;

    if (this._platform.SAFARI) {
      endInput.value = endInput.value;
      startInput.value = startInput.value;
      midInput.value = midInput.value;
    }

    endInput.min = Math.max(this._min, startInput.value);
    midInput.min = Math.max(this._min, midInput.value);
    startInput.max = Math.min(this._max, endInput.value);

    startInput._updateWidthInactive();
    endInput._updateWidthInactive();

    endInput.value < prevStartValue
      ? this._onTranslateXChangeBySideEffect(startInput, endInput, midInput)
      : this._onTranslateXChangeBySideEffect(endInput, startInput, midInput);

    if (oldEndValue !== endInput.value) {
      this._onValueChange(endInput);
    }

    if (oldMidValue !== midInput.value) {
      this._onValueChange(midInput);
    }

    if (oldStartValue !== startInput.value) {
      this._onValueChange(startInput);
    }
  }

  /**
   * Function that will be used to format the value before it is displayed
   * in the thumb label. Can be used to format very large number in order
   * for them to fit into the slider thumb.
   */
  @Input() displayWith: (value: number) => string = (value: number) => `${value}`;

  /** Whether animations have been disabled. */
  _noopAnimations = this._animationsDisabled();

  /** Observer used to monitor size changes in the slider. */
  private _resizeObserver!: ResizeObserver | null;

  // Stored dimensions to avoid calling getBoundingClientRect redundantly.
  _cachedWidth!: number;
  _cachedLeft!: number;

  _rippleRadius: number = 24;

  // The value indicator tooltip text for the visual slider thumb(s).

  /** @docs-private */
  protected startValueIndicatorText: string = '';

  /** @docs-private */
  protected endValueIndicatorText: string = '';

  /** @docs-private */
  protected midValueIndicatorText: string = '';

  // Used to control the translateX of the visual slider thumb(s).

  _endThumbTransform!: string;
  _startThumbTransform!: string;
  _midThumbTransform!: string;

  _isRange: boolean = false;

  private _hasViewInitialized: boolean = false;

  _hasAnimation: boolean = false;

  private _resizeTimer: null | ReturnType<typeof setTimeout> = null;

  private _platform = inject(Platform);

  constructor(...args: unknown[]);

  constructor() {}

  /** The radius of the native slider's knob. AFAIK there is no way to avoid hardcoding this. */
  _knobRadius: number = 8;

  _inputPadding!: number;

  ngAfterViewInit(): void {
    if (this._platform.isBrowser) {
      this._updateDimensions();
    }

    const eInput = this._getInput(_TriThumb.END);
    const sInput = this._getInput(_TriThumb.START);
    const mInput = this._getInput(_TriThumb.MID);
    this._isRange = !!eInput && !!sInput;
    this._cdr.detectChanges();

    this._inputPadding = this._rippleRadius - this._knobRadius;

    this._initUIRange(eInput as _TriSliderRangeThumb, sInput as _TriSliderRangeThumb, mInput as _TriSliderRangeThumb);

    this._updateTrackUI(eInput!);

    this._observeHostResize();
    this._cdr.detectChanges();
  }

  private _initUIRange(eInput: _TriSliderRangeThumb, sInput: _TriSliderRangeThumb, mInput: _TriSliderRangeThumb): void {
    eInput.initProps();
    eInput.initUI();

    sInput.initProps();
    sInput.initUI();

    mInput.initProps();
    mInput.initUI();

    eInput._updateMinMax();
    sInput._updateMinMax();
    mInput._updateMinMax();

    eInput._updateStaticStyles();
    sInput._updateStaticStyles();
    mInput._updateStaticStyles();

    this._updateValueIndicatorUIs();

    this._hasViewInitialized = true;

    eInput._updateThumbUIByValue();
    sInput._updateThumbUIByValue();
    mInput._updateThumbUIByValue();
  }

  ngOnDestroy(): void {
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  /** Starts observing and updating the slider if the host changes its size. */
  private _observeHostResize() {
    if (typeof ResizeObserver === 'undefined' || !ResizeObserver) {
      return;
    }

    this._ngZone.runOutsideAngular(() => {
      this._resizeObserver = new ResizeObserver(() => {
        if (this._isActive()) {
          return;
        }
        if (this._resizeTimer) {
          clearTimeout(this._resizeTimer);
        }
        this._onResize();
      });
      this._resizeObserver.observe(this._elementRef.nativeElement);
    });
  }

  /** Whether any of the thumbs are currently active. */
  private _isActive(): boolean {
    return (
      this._getThumb(_TriThumb.START)._isActive ||
      this._getThumb(_TriThumb.END)._isActive ||
      this._getThumb(_TriThumb.MID)._isActive
    );
  }

  //
  // private _getValue(thumbPosition: _TriThumb = _TriThumb.END): number {
  //   const input = this._getInput(thumbPosition);
  //   if (!input) {
  //     return this.min;
  //   }
  //   return input.value;
  // }

  private _skipUpdate(): boolean {
    return !!(
      this._getInput(_TriThumb.START)?._skipUIUpdate ||
      this._getInput(_TriThumb.END)?._skipUIUpdate ||
      this._getInput(_TriThumb.MID)?._skipUIUpdate
    );
  }

  /** Stores the slider dimensions. */
  _updateDimensions(): void {
    this._cachedWidth = this._elementRef.nativeElement.offsetWidth;
    this._cachedLeft = this._elementRef.nativeElement.getBoundingClientRect().left;
  }

  /** Sets the styles for the active portion of the track. */
  _setTrackActiveStyles(styles: { left: string; right: string; transform: string; transformOrigin: string }): void {
    const trackStyle = this._trackActive.nativeElement.style;

    trackStyle.left = styles.left;
    trackStyle.right = styles.right;
    trackStyle.transformOrigin = styles.transformOrigin;
    trackStyle.transform = styles.transform;
  }

  // Handlers for updating the slider ui.

  _onTranslateXChange(source: _TriSliderThumb): void {
    if (!this._hasViewInitialized) {
      return;
    }

    this._updateThumbUI(source);
    this._updateTrackUI(source);
    this._updateOverlappingThumbUI(source as _TriSliderRangeThumb);
  }

  _onTranslateXChangeBySideEffect(
    input1: _TriSliderRangeThumb,
    input2: _TriSliderRangeThumb,
    input3: _TriSliderRangeThumb,
  ): void {
    if (!this._hasViewInitialized) {
      return;
    }

    input1._updateThumbUIByValue();
    input2._updateThumbUIByValue();
    input3._updateThumbUIByValue();
  }

  _onValueChange(source: _TriSliderThumb): void {
    if (!this._hasViewInitialized) {
      return;
    }

    this._updateValueIndicatorUI(source);
    this._cdr.detectChanges();
  }

  _onMinMaxOrStepChange(): void {
    if (!this._hasViewInitialized) {
      return;
    }

    this._cdr.markForCheck();
  }

  _onResize(): void {
    if (!this._hasViewInitialized) {
      return;
    }

    this._updateDimensions();

    const eInput = this._getInput(_TriThumb.END) as _TriSliderRangeThumb;
    const sInput = this._getInput(_TriThumb.START) as _TriSliderRangeThumb;
    const mInput = this._getInput(_TriThumb.MID) as _TriSliderRangeThumb;

    eInput._updateThumbUIByValue();
    sInput._updateThumbUIByValue();
    mInput._updateThumbUIByValue();

    eInput._updateStaticStyles();
    sInput._updateStaticStyles();
    mInput._updateStaticStyles();

    eInput._updateMinMax();
    sInput._updateMinMax();
    mInput._updateMinMax();

    eInput._updateWidthInactive();
    sInput._updateWidthInactive();
    mInput._updateWidthInactive();

    this._cdr.detectChanges();
  }

  /** Whether or not the slider thumbs overlap. */
  private _thumbsOverlap: boolean = false;

  /** Returns true if the slider knobs are overlapping one another. */
  private _areThumbsOverlapping(): boolean {
    const startInput = this._getInput(_TriThumb.START);
    const endInput = this._getInput(_TriThumb.END);
    if (!startInput || !endInput) {
      return false;
    }
    return endInput.translateX - startInput.translateX < 20;
  }

  /**
   * Updates the class names of overlapping slider thumbs so
   * that the current active thumb is styled to be on "top".
   */
  private _updateOverlappingThumbClassNames(source: _TriSliderRangeThumb): void {
    const sibling = source.getOpposite()!;
    const sourceThumb = this._getThumb(source.thumbPosition);
    const siblingThumb = this._getThumb(sibling.thumbPosition);
    siblingThumb._hostElement.classList.remove('mdc-slider__thumb--top');
    sourceThumb._hostElement.classList.toggle('mdc-slider__thumb--top', this._thumbsOverlap);
  }

  /** Updates the UI of slider thumbs when they begin or stop overlapping. */
  private _updateOverlappingThumbUI(source: _TriSliderRangeThumb): void {
    if (!this._isRange || this._skipUpdate()) {
      return;
    }
    if (this._thumbsOverlap !== this._areThumbsOverlapping()) {
      this._thumbsOverlap = !this._thumbsOverlap;
      this._updateOverlappingThumbClassNames(source);
    }
  }

  // _TriThumb styles update conditions
  //
  // 1. TranslateX, resize, or dir change
  //    - Reason: The thumb styles need to be updated according to the new translateX.
  // 2. Min, max, or step
  //    - Reason: The value may have silently changed.

  /** Updates the translateX of the given thumb. */
  _updateThumbUI(source: _TriSliderThumb) {
    if (this._skipUpdate()) {
      return;
    }
    let thumb;
    // const thumb = this._getThumb(source.thumbPosition === _TriThumb.END ? _TriThumb.END : _TriThumb.START)!;
    switch (source.thumbPosition) {
      case _TriThumb.MID:
        thumb = this._getThumb(_TriThumb.MID);
        break;
      case _TriThumb.END:
        thumb = this._getThumb(_TriThumb.END);
        break;
      default:
        thumb = this._getThumb(_TriThumb.START);
    }

    thumb._hostElement.style.transform = `translateX(${source.translateX}px)`;
  }

  // Value indicator text update conditions
  //
  // 1. Value
  //    - Reason: The value displayed needs to be updated.
  // 2. Min, max, or step
  //    - Reason: The value may have silently changed.

  /** Updates the value indicator tooltip ui for the given thumb. */
  _updateValueIndicatorUI(source: _TriSliderThumb): void {
    if (this._skipUpdate()) {
      return;
    }

    const valuetext = this.displayWith(source.value);

    this._hasViewInitialized
      ? source._valuetext.set(valuetext)
      : source._hostElement.setAttribute('aria-valuetext', valuetext);

    if (this.discrete) {

      switch (source.thumbPosition) {
        case _TriThumb.MID:
          this.midValueIndicatorText = valuetext;
          break;
        case _TriThumb.END:
          this.endValueIndicatorText = valuetext;
          break;
        default:
          this.startValueIndicatorText = valuetext;
      }

      const visualThumb = this._getThumb(source.thumbPosition);
      valuetext.length < 3
        ? visualThumb._hostElement.classList.add('mdc-slider__thumb--short-value')
        : visualThumb._hostElement.classList.remove('mdc-slider__thumb--short-value');
    }
  }

  /** Updates all value indicator UIs in the slider. */
  private _updateValueIndicatorUIs(): void {
    const eInput = this._getInput(_TriThumb.END);
    const mInput = this._getInput(_TriThumb.MID);
    const sInput = this._getInput(_TriThumb.START);

    if (eInput) {
      this._updateValueIndicatorUI(eInput);
    }
    if (mInput) {
      this._updateValueIndicatorUI(mInput);
    }
    if (sInput) {
      this._updateValueIndicatorUI(sInput);
    }
  }

  // Track active update conditions
  //
  // 1. TranslateX
  //    - Reason: The track active should line up with the new thumb position.
  // 2. Min or max
  //    - Reason #1: The 'active' percentage needs to be recalculated.
  //    - Reason #2: The value may have silently changed.
  // 3. Step
  //    - Reason: The value may have silently changed causing the thumb(s) to shift.
  // 4. Dir change
  //    - Reason: The track active will need to be updated according to the new thumb position(s).
  // 5. Resize
  //    - Reason: The total width the 'active' tracks translateX is based on has changed.

  /** Updates the scale on the active portion of the track. */
  _updateTrackUI(source: _TriSliderThumb): void {
    if (this._skipUpdate()) {
      return;
    }
    this._isRange ? this._updateTrackUIRange(source as _TriSliderRangeThumb) : null;
  }

  private _updateTrackUIRange(source: _TriSliderRangeThumb): void {
    const opposite = source.getOpposite();
    if (!opposite || !this._cachedWidth) {
      return;
    }

    const activePercentage = Math.abs(opposite.translateX - source.translateX) / this._cachedWidth;

    if (source._isLeftThumb && this._cachedWidth) {
      this._setTrackActiveStyles({
        left: 'auto',
        right: `${this._cachedWidth - opposite.translateX}px`,
        transformOrigin: 'right',
        transform: `scaleX(${activePercentage})`,
      });
    } else {
      this._setTrackActiveStyles({
        left: `${opposite.translateX}px`,
        right: 'auto',
        transformOrigin: 'left',
        transform: `scaleX(${activePercentage})`,
      });
    }
  }

  /** Gets the slider thumb input of the given thumb position. */
  _getInput(thumbPosition: _TriThumb): _TriSliderThumb | _TriSliderRangeThumb | undefined {
    if (thumbPosition === _TriThumb.END && this._input) {
      return this._input;
    }
    if (this._inputs?.length) {
      switch (thumbPosition) {
        case _TriThumb.MID:
          return this._inputs.get(1);
        case _TriThumb.START:
          return this._inputs.first;
        default:
          return this._inputs.last;
      }
    }
    return;
  }

  /** Gets the slider thumb HTML input element of the given thumb position. */
  _getThumb(thumbPosition: _TriThumb): _TriSliderVisualThumb {
    // return thumbPosition === _TriThumb.END ? this._thumbs?.last! : this._thumbs?.first!;
    switch (thumbPosition) {
      case _TriThumb.MID:
        return this._thumbs?.get(1)!;
      case _TriThumb.END:
        return this._thumbs?.last!;
      default:
        return this._thumbs?.first!;
    }
  }

  /** Whether the given pointer event occurred within the bounds of the slider pointer's DOM Rect. */
  _isCursorOnSliderThumb(event: PointerEvent, rect: DOMRect) {
    const radius = rect.width / 2;
    const centerX = rect.x + radius;
    const centerY = rect.y + radius;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    return Math.pow(dx, 2) + Math.pow(dy, 2) < Math.pow(radius, 2);
  }

  _animationsDisabled(): boolean {
    return inject(ANIMATION_MODULE_TYPE, {optional: true}) === 'NoopAnimations';
  }

  protected readonly _TriThumb = _TriThumb;
}
