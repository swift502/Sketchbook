# Script aiding the creation of Sketchbook AI paths in Blender.
# Converts a vertex chain to a linked list of Sketchbook path nodes
# with the nodes' object data in the correct format.

import bpy

obj = bpy.context.selected_objects[0]
mesh = obj.data

# Create node wrapper
parent = bpy.data.objects.new( obj.name + '_path', None )
bpy.context.collection.objects.link(parent)
parent.empty_display_size = 1
parent.empty_display_type = 'PLAIN_AXES'
parent.location = obj.location

# Identify vertex neighbors
vertNeighbors = {}
for edge in mesh.edges:
    v1 = edge.vertices[0]
    v2 = edge.vertices[1]
    
    if str(v1) not in vertNeighbors:
        vertNeighbors[str(v1)] = []
    vertNeighbors[str(v1)].append(v2)

    if str(v2) not in vertNeighbors:
        vertNeighbors[str(v2)] = []
    vertNeighbors[str(v2)].append(v1)

def getNodeName(index):
    return obj.name + '_node' + str(index)

# Generate path nodes
finished = []
def generateNode(index, previousIndex):

    v = mesh.vertices[int(index)]
    pos = v.co
    
    empty = bpy.data.objects.new( getNodeName(v.index), None )
    bpy.context.collection.objects.link(empty)
    empty.empty_display_size = 1
    empty.empty_display_type = 'PLAIN_AXES'
    empty.location = pos
    empty.parent = parent
    
    nextIndex = vertNeighbors[str(index)][0]
    if nextIndex == previousIndex: nextIndex = vertNeighbors[str(index)][1]
    
    empty['data'] = 'pathNode'
    empty['path'] = obj.name
    empty['nextNode'] = getNodeName(nextIndex)
    empty['previousNode'] = getNodeName(previousIndex)
    
    finished.append(index)
    if nextIndex not in finished:
        generateNode(nextIndex, index)
    
generateNode(0, vertNeighbors['0'][0])
