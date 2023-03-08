import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);

  //Fetch random images from API
  const getRandomImage = async () => {
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/photos");
      const data = await response.json();
      const randomIndex = Math.floor(Math.random() * data.length);
      const randomImage = data[randomIndex].url;
      console.log(randomImage);
      return randomImage;
    } catch (error) {
      console.log(error);
    }
  };

  //handle delete component
  const handleDelete = (id) => {
    setMoveableComponents(moveableComponents.filter((component) => component.id !== id));
  }

  //set Random img to the background and random background size
  const addMoveable = async () => {
    const randomBg = await getRandomImage();
    console.log(`url(${randomBg})`);
    const backgroundSize = Math.random() < 0.5 ? 'cover' : 'contain';
    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        backgroundImage: `url(${randomBg})`,
        backgroundSize,
        updateEnd: true,
        dragArea: true,
      },
    ]);
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <button onClick={addMoveable}>Add Moveable1</button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
            onDelete={() => handleDelete(item.id)}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  backgroundImage,
  backgroundSize,
  backgroundPosition= "0 0",
  id,
  setSelected,
  isSelected = false,
  onDelete,
  handleDelete,
  updateEnd,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
    backgroundImage,
    backgroundSize,
    backgroundPosition
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  const [originalComponent, setOriginalComponent] = useState({
    top,
    left,
    width,
    height,
    backgroundImage,
    backgroundSize,
    backgroundPosition

  })

  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      backgroundImage,
      backgroundSize,
      backgroundPosition
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${newWidth}px`;
    ref.current.style.height = `${newHeight}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    //Update background position
    const bgLeft = -translateX;
    const bgTop = -translateY;
    const bgPosition = `${bgLeft}px ${bgTop}px`

    // Check if component exceeds the boundaries after resizing
    if (left + translateX < 0){
      translateX = -left;
    } else if (left + translateX + newWidth > parentBounds?.width){
      translateX = parentBounds?.width - left - newWidth;
    }

    if (top + translateY < 0){
      translateY = -top;
    } else if (top + translateY + newHeight > parentBounds?.height) {
      translateY = parentBounds?.height - top - newHeight;
    }

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
      backgroundPosition: bgPosition,
    });
  };

  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;

    const absoluteTop = top + beforeTranslate[1];
    const absoluteLeft = left + beforeTranslate[0];

    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: newWidth,
        height: newHeight,
        backgroundImage,
        backgroundSize
      },
      true
    );
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          backgroundImage
        }}
        onClick={() => setSelected(id)}
      />
      {isSelected && (
        <button style={{position: "absolute", top: "-20px", right:"10px"}}
                onClick={onDelete}> 
                Borrar
        </button>
      )}
      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            backgroundImage,
            backgroundSize
          });
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};

