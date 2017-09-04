import { ToolMode } from 'app/model/paper';
import * as paper from 'paper';

import { MasterTool, Tool, ZoomPanTool } from './tool';

/**
 * The entry class used for switching between different tool types.
 *
 * TODO: figure out how to deal with right mouse clicks in each tool
 */
export class ToolSwitcher {
  private readonly masterTool = new MasterTool();
  private readonly zoomPanTool = new ZoomPanTool();
  private readonly paperTool = new paper.Tool();
  private currentToolMode: ToolMode;
  private currentTool: Tool;

  constructor() {
    const processEventFn = (event: paper.ToolEvent | paper.KeyEvent) => this.processEvent(event);
    this.paperTool.on({
      mousedown: processEventFn,
      mousedrag: processEventFn,
      mousemove: processEventFn,
      mouseup: processEventFn,
      keydown: processEventFn,
      keyup: processEventFn,
    });
  }

  setToolMode(toolMode: ToolMode) {
    if (this.currentToolMode === toolMode) {
      return;
    }
    // TODO: clean this fixed distance code up?
    this.paperTool.fixedDistance = toolMode === ToolMode.Pencil ? 4 : undefined;
    this.currentToolMode = toolMode;
    this.processEvent();
  }

  private processEvent(event?: paper.ToolEvent | paper.KeyEvent) {
    const prevTool = this.currentTool;
    this.currentTool =
      this.currentToolMode === ToolMode.ZoomPan || (event && event.modifiers.space)
        ? this.zoomPanTool
        : this.masterTool;
    if (prevTool !== this.currentTool) {
      if (prevTool) {
        prevTool.onDeactivate();
      }
      if (this.currentTool) {
        this.currentTool.onActivate();
      }
    }
    if (this.currentTool) {
      if (event instanceof paper.ToolEvent) {
        this.currentTool.onMouseEvent(event);
      } else if (event instanceof paper.KeyEvent) {
        this.currentTool.onKeyEvent(event);
      } else {
        this.currentTool.onToolModeChanged(this.currentToolMode);
      }
    }
  }
}