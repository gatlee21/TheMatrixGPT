import { Scene } from "phaser";

export default class Preloader extends Scene {
  constructor() {
    super("preloader");
  }

  preload() {
    this.load.image("tiles", "assets/rogueLikeCity.png", {
      frameWidth: 12,
      frameHeight: 12,
    });

    this.load.tilemapTiledJSON("field-map", "assets/GrassPark.json");

    this.load.spritesheet("player", "assets/characters-ge.png", {
      frameWidth: 52,
      frameHeight: 72,
    });
  }

  create() {
    this.scene.start("creater");
  }

}