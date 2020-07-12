import { PathNode } from './PathNode';

export class Path
{
    public nodes: {[nodeName: string]: PathNode} = {};

    public addNode(child: any): void
    {
        let node = new PathNode();
        node.object = child;
        node.path = this;
        this.nodes[child.name] = node;
    }

    public connectNodes(): void
    {
        for (const nodeName in this.nodes)
        {
            if (this.nodes.hasOwnProperty(nodeName))
            {
                const node = this.nodes[nodeName];
                node.nextNode = this.nodes[node.object.userData.nextNode];
                node.previousNode = this.nodes[node.object.userData.previousNode];
            }
        }
    }

    public firstNode(): PathNode
    {
        return this.nodes[Object.keys(this.nodes)[6]];
    }
}