/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import { ChangeDetectorRef, InjectionToken, WritableSignal } from '@angular/core';
import { RippleGlobalOptions } from '@angular/material/core';

/**
 * Thumb types: range slider has two thumbs (START, END) whereas single point
 * slider only has one thumb (END).
 */
export enum _TriThumb {
  START = 1,
  MID = 2,
  END = 3,
}

/** Tick mark enum, for discrete sliders. */
export enum _MatTickMark {
  ACTIVE = 0,
  INACTIVE = 1,
}

/**
 * Injection token that can be used for a `TriSlider` to provide itself as a
 * parent to the `TriSliderThumb` and `TriSliderRangeThumb`.
 * Used primarily to avoid circular imports.
 * @docs-private
 */
export const TRI_SLIDER = new InjectionToken<{}>('_TriSlider');

/**
 * Injection token that can be used to query for a `TriSliderThumb`.
 * Used primarily to avoid circular imports.
 * @docs-private
 */
export const TRI_SLIDER_THUMB = new InjectionToken<{}>('_TriSliderThumb');

/**
 * Injection token that can be used to query for a `TriSliderRangeThumb`.
 * Used primarily to avoid circular imports.
 * @docs-private
 */
export const TRI_SLIDER_RANGE_THUMB = new InjectionToken<{}>('_TriSliderRangeThumb');

/**
 * Injection token that can be used to query for a `TriSliderVisualThumb`.
 * Used primarily to avoid circular imports.
 * @docs-private
 */
export const TRI_SLIDER_VISUAL_THUMB = new InjectionToken<{}>('_TriSliderVisualThumb');

/** Represents a drag event emitted by the TriSlider component. */
export interface TriSliderDragEvent {
  /** The TriSliderThumb that was interacted with. */
  source: _TriSliderThumb;

  /** The TriSlider that was interacted with. */
  parent: _TriSlider;

  /** The current value of the slider. */
  value: number;
}

export interface _TriSlider {
  /** Whether the given pointer event occurred within the bounds of the slider pointer's DOM Rect. */
  _isCursorOnSliderThumb(event: PointerEvent, rect: DOMRect): boolean;

  /** Gets the slider thumb input of the given thumb position. */
  _getInput(thumbPosition: _TriThumb): _TriSliderThumb | _TriSliderRangeThumb | undefined;

  /** Gets the slider thumb HTML input element of the given thumb position. */
  _getThumb(thumbPosition: _TriThumb): _TriSliderVisualThumb;

  /** The minimum value that the slider can have. */
  min: number;

  /** The maximum value that the slider can have. */
  max: number;

  /** The amount that slider values can increment or decrement by. */
  step: number;

  /** Whether the slider is disabled. */
  disabled: boolean;

  /** Whether the slider is a range slider. */
  _isRange: boolean;

  /** The stored width of the host element's bounding client rect. */
  _cachedWidth: number;

  /** The stored width of the host element's bounding client rect. */
  _cachedLeft: number;

  _rippleRadius: number;

  /** The global configuration for `matRipple` instances. */
  readonly _globalRippleOptions: RippleGlobalOptions | null;

  /** Whether animations have been disabled. */
  _noopAnimations: boolean;
  /**
   * The padding of the native slider input. This is added in order to make the region where the
   * thumb ripple extends past the end of the slider track clickable.
   */
  _inputPadding: number;

  /** Whether or not the slider should use animations. */
  _hasAnimation: boolean;

  /** Triggers UI updates that are needed after a slider input value has changed. */
  _onValueChange: (source: _TriSliderThumb) => void;

  /** Triggers UI updates that are needed after the slider thumb position has changed. */
  _onTranslateXChange: (source: _TriSliderThumb) => void;

  /** Updates the stored slider dimensions using the current bounding client rect. */
  _updateDimensions: () => void;

  /** Updates the scale on the active portion of the track. */
  _updateTrackUI: (source: _TriSliderThumb) => void;

  _cdr: ChangeDetectorRef;
}

export interface _TriSliderThumb {
  /** The minimum value that the slider can have. */
  min: number;

  /** The maximum value that the slider can have. */
  max: number;

  /** The amount that slider values can increment or decrement by. */
  step: number;

  /** The current value of this slider input. */
  value: number;

  /** The current translateX in px of the slider visual thumb. */
  translateX: number;

  /** Indicates whether this thumb is the start or end thumb. */
  thumbPosition: _TriThumb;

  /** Similar to percentage but calcualted using translateX relative to the total track width. */
  fillPercentage: number;

  /** Whether the slider is disabled. */
  disabled: boolean;

  /** The host native HTML input element. */
  _hostElement: HTMLInputElement;

  /** Whether the input is currently focused (either by tab or after clicking). */
  _isFocused: boolean;

  /** The aria-valuetext string representation of the input's value. */
  _valuetext: WritableSignal<string>;

  /**
   * Indicates whether UI updates should be skipped.
   *
   * This flag is used to avoid flickering
   * when correcting values on pointer up/down.
   */
  _skipUIUpdate: boolean;

  /** Handles the initialization of properties for the slider input. */
  initProps: () => void;

  /** Handles UI initialization controlled by this slider input. */
  initUI: () => void;

  /** Calculates the visual thumb's translateX based on the slider input's current value. */
  _calcTranslateXByValue: () => number;

  /** Updates the visual thumb based on the slider input's current value. */
  _updateThumbUIByValue: () => void;

  /**
   * Sets the slider input to disproportionate dimensions to allow for touch
   * events to be captured on touch devices.
   */
  _updateWidthInactive: () => void;

  /**
   * Used to set the slider width to the correct
   * dimensions while the user is dragging.
   */
  _updateWidthActive: () => void;
}

export interface _TriSliderRangeThumb extends _TriSliderThumb {
  /** Whether this slider corresponds to the input on the left hand side. */
  _isLeftThumb: boolean;

  /**
   * Gets the sibling TriSliderRangeThumb.
   * Returns undefined if it is too early in Angular's life cycle.
   */
  getOpposite: () => _TriSliderRangeThumb | undefined;

  getSiblings: () => _TriSliderRangeThumb[] | undefined;

  /** Used to cache whether this slider input corresponds to the visual left thumb. */
  _setIsLeftThumb: () => void;

  /** Updates the input styles to control whether it is pinned to the start or end of the mat-slider. */
  _updateStaticStyles: () => void;

  /** Updates the min and max properties of this slider input according to it's sibling. */
  _updateMinMax: () => void;
}

export interface _TriSliderVisualThumb {

  /** Whether the slider thumb is currently being pressed. */
  _isActive: boolean;

  /** The host native HTML input element. */
  _hostElement: HTMLElement;

  /** Shows the value indicator ui. */
  _showValueIndicator: () => void;

  /** Hides the value indicator ui. */
  _hideValueIndicator: () => void;

  /** Whether the slider visual thumb is currently showing any ripple. */
  _isShowingAnyRipple: () => boolean;
}
