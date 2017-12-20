import modifyTextureNode from '../../common/builders/texture';
import sockets from '../../sockets';
import * as D3NE from "d3-node-editor";

export default new D3NE.Component('Texture gradient', {
    builder(node) {
        modifyTextureNode(node);

        var inp = new D3NE.Input('Image', sockets.image);
        var inp2 = new D3NE.Input('Curve', sockets.curve);

        return node
            .addInput(inp)
            .addInput(inp2);
    },
    worker(node, inputs, outputs) {}
});
