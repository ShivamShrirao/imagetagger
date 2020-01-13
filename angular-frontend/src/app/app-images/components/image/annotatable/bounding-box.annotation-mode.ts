import {AnnotationMode, clamp} from './annotation-mode';
import {AnnotationVector} from '../../../../../domains/annotation/annotation';
import {AnnotationInImage} from '../../../../../domains/image/image';


export interface BoundingBoxVector extends AnnotationVector {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}


export class BoundingBoxAnnotationMode extends AnnotationMode {

    /** @inheritDoc */
    protected handleEvents(): AnnotationVector | null {
        if (this.mouseMoves.size > 0) {
            this.drawCrosshair(this.mouseMoves.top);
        }

        if (this.mouseDowns.size > 0) {
            if (this.mouseDowns.size !== this.mouseUps.size) {
                // The premature annotation is currently being drawn
                return this.calcPrematureAnnotation(this.mouseDowns.top, this.mouseMoves.top);

            } else {
                // The premature annotation is completely drawn but not yet saved
                return this.calcPrematureAnnotation(this.mouseDowns.pop(), this.mouseUps.pop());
            }
        }

        return null;
    }

    /** @inheritDoc */
    public drawPrematureAnnotation(annotation: BoundingBoxVector) {
        this.ctx.fillStyle = '#00000060';

        this.ctx.fillRect(0, 0, this.canvas.width, annotation.y1);       // Top
        this.ctx.fillRect(0, annotation.y2, this.canvas.width, this.canvas.height - annotation.y2);       // Bottom
        this.ctx.fillRect(0, annotation.y1, annotation.x1, annotation.y2 - annotation.y1);        // Left
        this.ctx.fillRect(annotation.x2, annotation.y1, this.canvas.width - annotation.x2, annotation.y2 - annotation.y1);     // Right

        this.drawAnnotationBox(annotation);
    }

    /** @inheritDoc */
    drawAnnotation(annotation: AnnotationInImage) {
        this.drawAnnotationBox(annotation.vector as BoundingBoxVector);
    }

    private drawAnnotationBox(annotation: BoundingBoxVector) {
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = '#000000';
        this.ctx.strokeRect(annotation.x1, annotation.y1, annotation.x2 - annotation.x1, annotation.y2 - annotation.y1);

    }

    private calcPrematureAnnotation(start: MouseEvent, end: MouseEvent): BoundingBoxVector {
        let top_left: { x: number, y: number };
        let bottom_right: { x: number, y: number };

        // Sort given points into top-left and bottom-right
        if (start.y < end.y) {
            if (start.x < end.x) {
                // Start is top-left, end is bottom-right
                top_left = {
                    x: this.scaledX(start),
                    y: this.scaledY(start)
                };
                bottom_right = {
                    x: this.scaledX(end),
                    y: this.scaledY(end)
                };

            } else {
                // Start is top-right, end is bottom-left
                top_left = {
                    x: this.scaledX(end),
                    y: this.scaledY(start)
                };
                bottom_right = {
                    x: this.scaledX(start),
                    y: this.scaledY(end)
                };
            }
        } else {
            if (start.x < end.x) {
                // Start is bottom-left, end ist top-right
                top_left = {
                    x: this.scaledX(start),
                    y: this.scaledY(end)
                };
                bottom_right = {
                    x: this.scaledX(end),
                    y: this.scaledY(start)
                };
            } else {
                // Start is bottom-right, end is top-left
                top_left = {
                    x: this.scaledX(end),
                    y: this.scaledY(end),
                };
                bottom_right = {
                    x: this.scaledX(start),
                    y: this.scaledY(start)
                };
            }
        }

        // noinspection JSSuspiciousNameCombination
        return {
            x1: clamp(Math.round(top_left.x), 0, this.canvas.width),
            y1: clamp(Math.round(top_left.y), 0, this.canvas.height),
            x2: clamp(Math.round(bottom_right.x), 0, this.canvas.width),
            y2: clamp(Math.round(bottom_right.y), 0, this.canvas.height)
        };
    }
}