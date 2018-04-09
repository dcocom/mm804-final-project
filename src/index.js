import 'vtk.js/Sources/favicon';

import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtkHttpDataSetReader from 'vtk.js/Sources/IO/Core/HttpDataSetReader';
import vtkImageMarchingCubes from 'vtk.js/Sources/Filters/General/ImageMarchingCubes';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';

import controlPanel from './controller.html';
import vtkXMLImageDataReader from "vtk.js/Sources/IO/XML/XMLImageDataReader/index";

const fullScreenRenderWindow = vtkFullScreenRenderWindow.newInstance({
    background: [0, 0, 0],
});
const renderWindow = fullScreenRenderWindow.getRenderWindow();
const renderer = fullScreenRenderWindow.getRenderer();

fullScreenRenderWindow.addController(controlPanel);

const actor = vtkActor.newInstance();
const mapper = vtkMapper.newInstance();
const marchingCube = vtkImageMarchingCubes.newInstance({
    contourValue: 0.0,
    computeNormals: true,
    mergePoints: true,
});

actor.setMapper(mapper);
mapper.setInputConnection(marchingCube.getOutputPort());

function updateIsoValue(e) {
    const isoValue = Number(e.target.value);
    marchingCube.setContourValue(isoValue);
    renderWindow.render();
}

const reader = vtkXMLImageDataReader.newInstance();
marchingCube.setInputConnection(reader.getOutputPort());

let input = document.getElementById('file-reader');
input.onchange = function (evt) {
    let f = evt.target.files[0];
    let reader = new FileReader();
    reader.onload = function (e) {
        let contents = e.currentTarget.result;
        console.log(contents);
        renderVolume(contents);
    };
    reader.readAsArrayBuffer(f);
};

function renderVolume(fileContent){
    reader.parseAsArrayBuffer(fileContent);
    const data = reader.getOutputData();
    const dataRange = data
        .getPointData()
        .getScalars()
        .getRange();
    const firstIsoValue = (dataRange[0] + dataRange[1]) / 3;

    const el = document.querySelector('.isoValue');
    el.setAttribute('min', dataRange[0]);
    el.setAttribute('max', dataRange[1]);
    el.setAttribute('value', firstIsoValue);
    el.addEventListener('input', updateIsoValue);

    marchingCube.setContourValue(firstIsoValue);
    renderer.addActor(actor);
    renderer.getActiveCamera().set({ position: [1, 1, 0], viewUp: [0, 0, -1] });
    renderer.resetCamera();
    renderWindow.render();
}

global.fullScreen = fullScreenRenderWindow;
global.actor = actor;
global.mapper = mapper;
global.marchingCube = marchingCube;