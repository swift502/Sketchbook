import { PathNode } from './PathNode';
export declare class Path {
    nodes: {
        [nodeName: string]: PathNode;
    };
    addNode(child: any): void;
    connectNodes(): void;
    firstNode(): PathNode;
}
