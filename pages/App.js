import React, { useEffect, useState } from "react";


const App = () => {
      const [game, setGame] = useState();

      useEffect(() => {

        // Lazy load Phaser because of gotcha with Next.js
        async function initPhaser() {
          const Phaser = await import("phaser");
          const { default: GridEngine } = await import("grid-engine");
          const { default: Preloader } = await import("./preload");
          const { default: Creater } = await import("./create");

          const phaserGame = new Phaser.Game({
              title: "GPTRPG",
              render: {
                antialias: false,
              },
              type: Phaser.AUTO,
              physics: {
                default: "arcade",
              },
              plugins: {
                scene: [
                  {
                    key: "gridEngine",
                    plugin: GridEngine,
                    mapping: "gridEngine",
                  },
                ],
              },
              scene: [
                Preloader,
                Creater,
              ],
              scale: {
                width: window.innerWidth,
                height: window.innerHeight,
                autoCenter: Phaser.Scale.CENTER_BOTH,
              },
              parent: "game-content",
              backgroundColor: "#409c62",
            });

            setGame(phaserGame);

        }

        initPhaser();

       
      }, []);

    return (
      <>
        <div id="game-content" key="game-content">

        </div>
      </>
    )
}

export default App;