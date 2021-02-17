
import dat from "dat.gui";
import { Euler, Vector3 } from "three";

function addVector3(gui: dat.GUI, folderName: string, vector: Vector3, { step = 0.1 } = {}): void {
    const folder = gui.addFolder(folderName);

    
    folder.add(vector, 'x').step(step);
    folder.add(vector, 'y').step(step);
    folder.add(vector, 'z').step(step);
}


function addEuler(gui: dat.GUI, folderName: string, euler: Euler, { step = 0.1 } = {}): void {
    const folder = gui.addFolder(folderName);
    
    folder.add(euler, 'x').step(step);
    folder.add(euler, 'y').step(step);
    folder.add(euler, 'z').step(step);
}

export default {
    addVector3,
    addEuler,
}