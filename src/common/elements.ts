import * as $ from 'jquery';
import { MEMORY_CAPACITY } from './constants'

$('body').prepend(`
  <div class="statistic">
    <div class="control-panel">
      <div class="timer">
        <div class="timer-face">0</div>
      </div>
      <svg viewBox='0 0 104 104' class='control-button' state='play'>
        <circle class="circle" cx="51" cy="51" r="50" stroke-dasharray="314" stroke-dashoffset="0"
          style="stroke-width:2px;stroke:white;" />
        <line id='line1' x1="38" y1="30" x2="38" y2="70" style="stroke-width:4px;stroke:white;stroke-linecap: round;" />
        <path id='line2' d="M 66 30 L 66 50 L 66 70" rx="10" ry="10"
          style="stroke-width:4px;stroke:white;fill:white;stroke-linejoin: round;stroke-linecap: round;">
          <animate attributeName="d" dur="300ms" from="M 66 30 L 66 50 L 66 70" to="M 38 30 L 70 50 L 38 70"
            begin="indefinite" fill="freeze" class="from_pause_to_play" />
        </path>
        <animate xlink:href="#line2" attributeName="d" dur="300ms" from="M 38 30 L 70 50 L 38 70"
          to="M 66 30 L 66 50 L 66 70" fill="freeze" class="from_play_to_pause" begin="indefinite" />
      </svg>
    </div>
    <div>
      <div class='speedometer-label'></div>
      <input class="speedometer" type="range" value="1" min="0.25" max="3" step="0.25"/>
    </div>
    ${ MEMORY_CAPACITY != Infinity 
      ? `
        <div class="memory-label">Memory</div>
        <div class="memory"></div>
      `
      : ``
    }
    <div class="elements-counter"></div>
  </div>
  <div class="container">
    <div class="bar client"></div>
    <div class="bar server"></div>
    <div class="el request"></div>
    <div class="el request"></div>
    <div class="el request"></div>
    <div class="el request"></div>
    <div class="el request"></div>
    <div class="sub">
      <div class="response-content">
      </div>
    </div>
  </div>
`)

export const timerFace = $('.timer>.timer-face')
export const memoryTracker = $('.memory')
export const client = $('.client')
export const server = $('.server')
export const container = $('.container');
export const request = $('.request');
export const responseContent = $('.response-content');
export const controlButton = $('.control-button');
export const controlButtonPlay = $('.control-button .from_pause_to_play');
export const controlButtonPause = $('.control-button .from_play_to_pause');
export const speedometer = $('.speedometer');
export const speedometerLabel = $('.speedometer-label');
export const elementsCounter = $('.elements-counter');