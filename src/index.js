import 'vtk.js/Sources/favicon';

import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtkImageMarchingCubes from 'vtk.js/Sources/Filters/General/ImageMarchingCubes';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkXMLImageDataReader from "vtk.js/Sources/IO/XML/XMLImageDataReader/index";
import vtkImageMapper from 'vtk.js/Sources/Rendering/Core/ImageMapper';
import vtkImageSlice from 'vtk.js/Sources/Rendering/Core/ImageSlice';
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
import vtkPiecewiseFunction from 'vtk.js/Sources/Common/DataModel/PiecewiseFunction';
import vtkVolume from 'vtk.js/Sources/Rendering/Core/Volume';
import vtkVolumeMapper from 'vtk.js/Sources/Rendering/Core/VolumeMapper';
import vtkPiecewiseGaussianWidget from 'vtk.js/Sources/Interaction/Widgets/PiecewiseGaussianWidget';
import vtkColorMaps from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps';

import controlPanel from './controller.html';
import controlPanel2 from './controlPanel.html';
import vtkOpenGLRenderWindow from "vtk.js/Sources/Rendering/OpenGL/RenderWindow/index";
import vtkRenderWindow from "vtk.js/Sources/Rendering/Core/RenderWindow/index";
import vtkRenderer from "vtk.js/Sources/Rendering/Core/Renderer/index";
import vtkRenderWindowInteractor from "vtk.js/Sources/Rendering/Core/RenderWindowInteractor/index";

const backgroundColor = [0.054, 0.145, 0.176];
const vtiReader = vtkXMLImageDataReader.newInstance();
const rootContainer = document.querySelector('#main-container');
let containerStyle = {
    position: 'relative',
    top: '0px',
    left: '0px',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
};

let input = document.getElementById('file-reader');
let buttonRender = document.getElementById('btn-render');
buttonRender.onclick = function () {
    let files = input.files[0];
    let fileReader = new FileReader();
    fileReader.onload = function (e) {
        let contents = e.currentTarget.result;
        vtiReader.parseAsArrayBuffer(contents);
        vtiReader.parseAsArrayBuffer(contents);
        renderVolume();
    };
    fileReader.readAsArrayBuffer(files);
};

function renderVolume() {
    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
        background: backgroundColor,
        rootContainer,
        containerStyle
    });
    const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();

// ----------------------------------------------------------------------------
// Example code
// ----------------------------------------------------------------------------
// Server is not sending the .gz and whith the compress header
// Need to fetch the true file name and uncompress it locally
// ----------------------------------------------------------------------------

    const actor = vtkVolume.newInstance();
    const mapper = vtkVolumeMapper.newInstance();

    actor.setMapper(mapper);

// create color and opacity transfer functions
    const ctfun = vtkColorTransferFunction.newInstance();
    ctfun.addRGBPoint(200.0, 0.4, 0.2, 0.0);
    ctfun.addRGBPoint(2000.0, 1.0, 1.0, 1.0);
    ctfun.addRGBPoint(-3024, 0.0, 0.0, 0.0);
    ctfun.addRGBPoint(-77, 0.54902, 0.25098, 0.14902);
    ctfun.addRGBPoint(94, 0.882353, 0.603922, 0.290196);
    ctfun.addRGBPoint(179, 1, 0.937033, 0.954531);
    ctfun.addRGBPoint(260, 0.615686, 0, 0);
    ctfun.addRGBPoint(3071, 0.827451, 0.658824, 1);
    const ofun = vtkPiecewiseFunction.newInstance();
    ofun.addPoint(200.0, 0.0);
    ofun.addPoint(1200.0, 0.5);
    ofun.addPoint(3000.0, 0.8);
    ofun.addPoint(-3024, 0.0);
    ofun.addPoint(-77, 0.0);
    ofun.addPoint(94, 0.29);
    ofun.addPoint(179, 0.55);
    ofun.addPoint(260, 0.84);
    ofun.addPoint(3071, 0.875);
    actor.getProperty().setRGBTransferFunction(0, ctfun);
    actor.getProperty().setScalarOpacity(0, ofun);
    actor.getProperty().setScalarOpacityUnitDistance(0, 4.5);
    actor.getProperty().setInterpolationTypeToLinear();
    actor.getProperty().setUseGradientOpacity(0, true);
    actor.getProperty().setGradientOpacityMinimumValue(0, 15);
    actor.getProperty().setGradientOpacityMinimumOpacity(0, 0.0);
    actor.getProperty().setGradientOpacityMaximumValue(0, 100);
    actor.getProperty().setGradientOpacityMaximumOpacity(0, 1.0);
    actor.getProperty().setShade(true);
    actor.getProperty().setAmbient(0.2);
    actor.getProperty().setDiffuse(0.7);
    actor.getProperty().setSpecular(0.3);
    actor.getProperty().setSpecularPower(8.0);


    mapper.setInputConnection(vtiReader.getOutputPort());

    renderer.addVolume(actor);
    renderer.resetCamera();
    renderer.getActiveCamera().zoom(1.5);
    renderer.getActiveCamera().elevation(70);
    renderer.updateLightsGeometryToFollowCamera();
    renderWindow.render();
}

function renderVolumeContour() {
    const fullScreenRenderWindow = vtkFullScreenRenderWindow.newInstance({
        background: backgroundColor,
        rootContainer,
        containerStyle
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

    marchingCube.setInputConnection(vtiReader.getOutputPort());
    const data = vtiReader.getOutputData();
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
    renderer.getActiveCamera().set({position: [1, 1, 0], viewUp: [0, 0, -1]});
    renderer.resetCamera();
    renderWindow.render();
    global.marchingCube = marchingCube;
}

function renderSliceImage() {
    const fullScreenRenderWindow = vtkFullScreenRenderWindow.newInstance({
        background: backgroundColor,
        rootContainer,
        containerStyle
    });

    const renderWindow = fullScreenRenderWindow.getRenderWindow();
    const renderer = fullScreenRenderWindow.getRenderer();
    fullScreenRenderWindow.addController(controlPanel2);

    const imageActorI = vtkImageSlice.newInstance();
    const imageActorJ = vtkImageSlice.newInstance();
    const imageActorK = vtkImageSlice.newInstance();

    renderer.addActor(imageActorK);
    renderer.addActor(imageActorJ);
    renderer.addActor(imageActorI);

    function updateColorLevel(e) {
        const colorLevel = Number(
            (e ? e.target : document.querySelector('.colorLevel')).value
        );
        imageActorI.getProperty().setColorLevel(colorLevel);
        imageActorJ.getProperty().setColorLevel(colorLevel);
        imageActorK.getProperty().setColorLevel(colorLevel);
        renderWindow.render();
    }

    function updateColorWindow(e) {
        const colorLevel = Number(
            (e ? e.target : document.querySelector('.colorWindow')).value
        );
        imageActorI.getProperty().setColorWindow(colorLevel);
        imageActorJ.getProperty().setColorWindow(colorLevel);
        imageActorK.getProperty().setColorWindow(colorLevel);
        renderWindow.render();
    }

    const data = vtiReader.getOutputData();
    const dataRange = data
        .getPointData()
        .getScalars()
        .getRange();
    const extent = data.getExtent();

    const imageMapperK = vtkImageMapper.newInstance();
    imageMapperK.setInputData(data);
    imageMapperK.setKSlice(30);
    imageActorK.setMapper(imageMapperK);

    const imageMapperJ = vtkImageMapper.newInstance();
    imageMapperJ.setInputData(data);
    imageMapperJ.setJSlice(30);
    imageActorJ.setMapper(imageMapperJ);

    const imageMapperI = vtkImageMapper.newInstance();
    imageMapperI.setInputData(data);
    imageMapperI.setISlice(30);
    imageActorI.setMapper(imageMapperI);

    renderer.resetCamera();
    renderer.resetCameraClippingRange();
    renderWindow.render();

    ['.sliceI', '.sliceJ', '.sliceK'].forEach((selector, idx) => {
        const el = document.querySelector(selector);
        el.setAttribute('min', extent[idx * 2 + 0]);
        el.setAttribute('max', extent[idx * 2 + 1]);
        el.setAttribute('value', 30);
    });

    ['.colorLevel', '.colorWindow'].forEach((selector) => {
        document.querySelector(selector).setAttribute('max', dataRange[1]);
        document.querySelector(selector).setAttribute('value', dataRange[1]);
    });
    document
        .querySelector('.colorLevel')
        .setAttribute('value', (dataRange[0] + dataRange[1]) / 2);
    updateColorLevel();
    updateColorWindow();

    document.querySelector('.sliceI').addEventListener('input', (e) => {
        imageActorI.getMapper().setISlice(Number(e.target.value));
        renderWindow.render();
    });

    document.querySelector('.sliceJ').addEventListener('input', (e) => {
        imageActorJ.getMapper().setJSlice(Number(e.target.value));
        renderWindow.render();
    });

    document.querySelector('.sliceK').addEventListener('input', (e) => {
        imageActorK.getMapper().setKSlice(Number(e.target.value));
        renderWindow.render();
    });

    document
        .querySelector('.colorLevel')
        .addEventListener('input', updateColorLevel);
    document
        .querySelector('.colorWindow')
        .addEventListener('input', updateColorWindow);

    global.fullScreen = fullScreenRenderWindow;
    global.imageActorI = imageActorI;
    global.imageActorJ = imageActorJ;
    global.imageActorK = imageActorK;
}


function renderVolumeColorTransformation() {
    const container = document.querySelector('#main-container');
    const renderWindowContainer = document.createElement('div');
    container.appendChild(renderWindowContainer);

    const renderWindow = vtkRenderWindow.newInstance();
    const interac = vtkRenderWindowInteractor.newInstance();

    const upperRenderer = vtkRenderer.newInstance();
    upperRenderer.setViewport(0, 0.5, 1, 1); // xmin, ymin, xmax, ymax
    renderWindow.addRenderer(upperRenderer);

    const lowerLeftRenderer = vtkRenderer.newInstance();
    lowerLeftRenderer.setViewport(0, 0, 0.5, 0.5); // xmin, ymin, xmax, ymax
    renderWindow.addRenderer(lowerLeftRenderer);

    const lowerRightRenderer = vtkRenderer.newInstance();
    lowerRightRenderer.setViewport(0.5, 0, 1, 0.5); // xmin, ymin, xmax, ymax
    renderWindow.addRenderer(lowerRightRenderer);

    let presetIndex = 1;
    const globalDataRange = [0, 255];
    const lookupTable = vtkColorTransferFunction.newInstance();


    // Create Widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.style.position = 'absolute';
    widgetContainer.style.top = 'calc(10px + 1em)';
    widgetContainer.style.left = '5px';
    widgetContainer.style.background = 'rgba(255, 255, 255, 0.3)';
    container.appendChild(widgetContainer);

    // Create Label for preset
    const labelContainer = document.createElement('div');
    labelContainer.style.position = 'absolute';
    labelContainer.style.top = '70px';
    labelContainer.style.left = '5px';
    labelContainer.style.width = '100%';
    labelContainer.style.color = 'white';
    labelContainer.style.textAlign = 'center';
    labelContainer.style.userSelect = 'none';
    labelContainer.style.cursor = 'pointer';
    container.appendChild(labelContainer);

    //---------------------------------------------------------------------------

    function changePreset(delta = 1) {
        presetIndex =
            (presetIndex + delta + vtkColorMaps.rgbPresetNames.length) %
            vtkColorMaps.rgbPresetNames.length;
        lookupTable.applyColorMap(vtkColorMaps.getPresetByName(vtkColorMaps.rgbPresetNames[presetIndex]));
        lookupTable.setMappingRange(...globalDataRange);
        lookupTable.updateRange();
        labelContainer.innerHTML = vtkColorMaps.rgbPresetNames[presetIndex];
    }

    let intervalID = null;

    function stopInterval() {
        if (intervalID !== null) {
            clearInterval(intervalID);
            intervalID = null;
        }
    }

    labelContainer.addEventListener('click', (event) => {
        if (event.pageX < 200) {
            stopInterval();
            changePreset(-1);
        } else {
            stopInterval();
            changePreset(1);
        }
    });

    //-------widget---------------------------------------------
    const widget = vtkPiecewiseGaussianWidget.newInstance({numberOfBins: 256, size: [400, 150],});
    widget.updateStyle({
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        histogramColor: 'rgba(100, 100, 100, 0.5)',
        strokeColor: 'rgb(0, 0, 0)',
        activeColor: 'rgb(255, 255, 255)',
        handleColor: 'rgb(50, 150, 50)',
        buttonDisableFillColor: 'rgba(255, 255, 255, 0.5)',
        buttonDisableStrokeColor: 'rgba(0, 0, 0, 0.5)',
        buttonStrokeColor: 'rgba(0, 0, 0, 1)',
        buttonFillColor: 'rgba(255, 255, 255, 1)',
        strokeWidth: 2,
        activeStrokeWidth: 3,
        buttonStrokeWidth: 1.5,
        handleWidth: 3,
        iconSize: 20, // Can be 0 if you want to remove buttons (dblClick for (+) / rightClick for (-))
        padding: 10,
    });

    const piecewiseFunction = vtkPiecewiseFunction.newInstance();

    const Actor1 = vtkVolume.newInstance();
    const Mapper1 = vtkVolumeMapper.newInstance({sampleDistance: 1.1});


    const data = vtiReader.getOutputData();
    const dataArray = data.getPointData().getScalars();
    const dataRange = dataArray.getRange();
    globalDataRange[0] = dataRange[0];
    globalDataRange[1] = dataRange[1];


    // Update Lookup table
    changePreset();

    // Automatic switch to next preset every 5s
    if (!container) {
        intervalID = setInterval(changePreset, 5000);
    }

    widget.setDataArray(dataArray.getData());
    widget.applyOpacity(piecewiseFunction);

    widget.setColorTransferFunction(lookupTable);
    lookupTable.onModified(() => {
        widget.render();
        renderWindow.render();
    });

    Actor1.setMapper(Mapper1);
    Mapper1.setInputConnection(vtiReader.getOutputPort());


    Actor1.getProperty().setRGBTransferFunction(0, lookupTable);
    Actor1.getProperty().setScalarOpacity(0, piecewiseFunction);
    Actor1.getProperty().setInterpolationTypeToFastLinear();


    upperRenderer.addVolume(Actor1);
    upperRenderer.setBackground(backgroundColor);
    upperRenderer.resetCamera();
    //upperRenderer.getActiveCamera().zoom(1.5);
    upperRenderer.getActiveCamera().elevation(70);
    upperRenderer.updateLightsGeometryToFollowCamera();
    //renderWindow.render();


    //-------------------------------------------------------------------------------------------
    widget.addGaussian(0.425, 0.5, 0.2, 0.3, 0.2);
    widget.addGaussian(0.75, 1, 0.3, 0, 0);

    widget.setContainer(widgetContainer);
    widget.bindMouseListeners();

    widget.onAnimation((start) => {
        if (start) {
            renderWindow.getInteractor().requestAnimation(widget);
        } else {
            renderWindow.getInteractor().cancelAnimation(widget);
        }
    });

    widget.onOpacityChange(() => {
        widget.applyOpacity(piecewiseFunction);
        if (!renderWindow.getInteractor().isAnimating()) {
            renderWindow.render();
        }
    });
    //--ending rendering
    //---------------------------------------------------------------------------------------------------

//-----------------------------------------------------------------------vieport ---leftupper--------------------------------------------------------------------------------------
    const Actor2 = vtkVolume.newInstance();
    const Mapper2 = vtkVolumeMapper.newInstance();
    Actor2.setMapper(Mapper2);


    //create color and opacity transfer functions
    const ctfun = vtkColorTransferFunction.newInstance();
    ctfun.addRGBPoint(0, 85 / 255.0, 0, 0);
    ctfun.addRGBPoint(95, 1.0, 1.0, 1.0);
    ctfun.addRGBPoint(225, 0.66, 0.66, 0.5);
    ctfun.addRGBPoint(255, 0.3, 1.0, 0.5);
    const ofun = vtkPiecewiseFunction.newInstance();
    ofun.addPoint(0.0, 0.0);
    ofun.addPoint(255.0, 1.0);
    Actor2.getProperty().setRGBTransferFunction(0, ctfun);
    Actor2.getProperty().setScalarOpacity(0, ofun);
    Actor2.getProperty().setScalarOpacityUnitDistance(0, 3.0);
    Actor2.getProperty().setInterpolationTypeToLinear();
    Actor2.getProperty().setUseGradientOpacity(0, true);
    //Actor2.getProperty().
    Actor2.getProperty().setGradientOpacityMinimumValue(0, 2);
    Actor2.getProperty().setGradientOpacityMinimumOpacity(0, 0.0);
    Actor2.getProperty().setGradientOpacityMaximumValue(0, 20);
    Actor2.getProperty().setGradientOpacityMaximumOpacity(0, 1.0);
    Actor2.getProperty().setShade(true);
    Actor2.getProperty().setAmbient(0.2);
    Actor2.getProperty().setDiffuse(0.7);
    Actor2.getProperty().setSpecular(0.3);
    Actor2.getProperty().setSpecularPower(8.0);

    //const sphereSource = vtkSphereSource.newInstance();
    Mapper2.setInputConnection(vtiReader.getOutputPort());

    lowerLeftRenderer.addVolume(Actor2);
    lowerLeftRenderer.setBackground(backgroundColor);
    lowerLeftRenderer.resetCamera();
    //lowerLeftRenderer.getActiveCamera().zoom(0.5);
    //lowerLeftRenderer.getActiveCamera().elevation(70);
    lowerLeftRenderer.updateLightsGeometryToFollowCamera();


    //-------------------------------------------------------------------------------------------------
    // Lower right renderer

    const Actor3 = vtkVolume.newInstance();
    const Mapper3 = vtkVolumeMapper.newInstance();
    Actor3.setMapper(Mapper3);

    //Color Transfer Function
    const volumeColor2 = vtkColorTransferFunction.newInstance();
    volumeColor2.addRGBPoint(-3024, 0.0, 0.0, 0.0);
    volumeColor2.addRGBPoint(-77, 0.55, 0.25, 0.15);
    volumeColor2.addRGBPoint(94, 0.88, 0.60, 0.29);
    volumeColor2.addRGBPoint(179, 1.0, 0.94, 0.95);
    volumeColor2.addRGBPoint(260, 1.0, 0.0, 0.0);
    volumeColor2.addRGBPoint(3071, 0.82, 0.66, 1.0);

    //piecewisse function
    const volumeScalarOpacity2 = vtkPiecewiseFunction.newInstance();
    volumeScalarOpacity2.addPoint(-3024, 0.00);
    volumeScalarOpacity2.addPoint(-77, 0.00);
    volumeScalarOpacity2.addPoint(94, 0.29);
    volumeScalarOpacity2.addPoint(179, 0.55);
    volumeScalarOpacity2.addPoint(260, 0.84);
    volumeScalarOpacity2.addPoint(3071, 0.875);

    //Adding Gradient opacity transfer function
    const volumeGradientOpacity2 = vtkPiecewiseFunction.newInstance();
    volumeGradientOpacity2.addPoint(-3024, 0.00);
    volumeGradientOpacity2.addPoint(-77, 0.00);
    volumeGradientOpacity2.addPoint(94, 0.29);
    volumeGradientOpacity2.addPoint(179, 0.55);
    volumeGradientOpacity2.addPoint(260, 0.84);
    volumeGradientOpacity2.addPoint(3071, 0.875);


    Actor3.getProperty().setRGBTransferFunction(0, volumeColor2);
    Actor3.getProperty().setScalarOpacity(0, volumeScalarOpacity2);
    Actor3.getProperty().setScalarOpacityUnitDistance(0, 3.0);
    Actor3.getProperty().setInterpolationTypeToLinear();
    Actor3.getProperty().setUseGradientOpacity(0, volumeGradientOpacity2);
    Actor3.getProperty().setInterpolationTypeToLinear();

    Actor3.getProperty().setShade(true);
    Actor3.getProperty().setAmbient(0.45);
    Actor3.getProperty().setDiffuse(0.78);
    Actor3.getProperty().setSpecular(0.29);
    Actor3.getProperty().setSpecularPower(8.0);


    //const cubeSource = vtkCubeSource.newInstance();
    Mapper3.setInputConnection(vtiReader.getOutputPort());
    //------------------------------------------------------------------------------------------------------

    lowerRightRenderer.addVolume(Actor3);
    lowerRightRenderer.setBackground(backgroundColor);
    lowerRightRenderer.resetCamera();
    //lowerRightRenderer.getActiveCamera().zoom(0.5);
    lowerRightRenderer.getActiveCamera().elevation(100);
    lowerRightRenderer.updateLightsGeometryToFollowCamera();


    const glwindow = vtkOpenGLRenderWindow.newInstance();
    glwindow.setContainer(renderWindowContainer);
    renderWindow.addView(glwindow);
    glwindow.setSize(window.innerWidth, window.innerHeight - 61);

    interac.setView(glwindow);
    interac.initialize();
    interac.bindEvents(container);

    renderWindow.render();
}


$('#volume-contour').on('click', renderVolumeContour);
$('#sliced-image').on('click', renderSliceImage);
$('#render-volume').on('click', renderVolume);
$('#color-transform').on('click', renderVolumeColorTransformation);