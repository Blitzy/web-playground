
import dat from "dat.gui";
import { Euler, Vector3 } from "three";

function addVector3(gui: dat.GUI, folderName: string, vector: Vector3, { step = 0.1, listen = false } = {}): void {
    const folder = gui.addFolder(folderName);

    
    const x = folder.add(vector, 'x').step(step);
    if (listen) { x.listen(); }

    const y = folder.add(vector, 'y').step(step);
    if (listen) { y.listen(); }

    const z = folder.add(vector, 'z').step(step);
    if (listen) { z.listen(); }
}


function addEuler(gui: dat.GUI, folderName: string, euler: Euler, { step = 0.1, listen = false } = {}): void {
    const folder = gui.addFolder(folderName);
    
    const x = folder.add(euler, 'x').step(step);
    if (listen) { x.listen(); }

    const y = folder.add(euler, 'y').step(step);
    if (listen) { y.listen(); }

    const z =folder.add(euler, 'z').step(step);
    if (listen) { z.listen(); }
}

export default {
    addVector3,
    addEuler,
}