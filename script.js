import {
  Component,
  html,
  render
} from "https://unpkg.com/htm@2/preact/standalone.module.js";

const imageSize = 320;

const initialState = () => ({
  showPreview: false,
  imagePreview: null,
  imageQuality: 1 + Math.random() * 9
});

class App extends Component {
  constructor() {
    super();
    this.state = initialState();
    this.videoRef = null;
  }

  componentDidMount() {
    this.connectCamera();
  }

  async connectCamera() {
    if (!this.videoRef) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        height: { max: imageSize },
        width: { max: imageSize }
      }
    });
    this.videoRef.srcObject = stream;
    this.videoRef.play();
  }

  disconnectCamera() {
    this.videoRef.srcObject = null;
    this.videoRef.pause();
  }

  render() {
    const previewClasses = ["screen", "screen--preview"];
    if (this.state.showPreview) {
      previewClasses.push("screen--preview-visible");
    }
    const previewClassString = previewClasses.join(" ");

    return html`
      <div class="container">
        <div class="screen">
          <video
            class="preview"
            tabindex="-1"
            ref=${ref => {
              this.videoRef = ref;
            }}
            width="${imageSize}"
            height="${imageSize}"
            playsinline
          ></video>
          <button
            class="button button--bottom-center button--release"
            onClick=${() => this.shoot()}
          ></button>
        </div>
        <div class="${previewClassString}">
          ${this.state.imagePreview
            ? html`
                <img
                  class="preview"
                  src="${this.state.imagePreview}"
                  width="${imageSize}"
                  height="${imageSize}"
                />
              `
            : html`
                <div class="loading">loading…</div>
              `}
          <button
            class="button button--bottom-center button--close-preview"
            onClick=${() => this.dismissPreview()}
          ></button>
        </div>
        <div class="quality">
          Quality: ${this.state.imageQuality.toFixed(2)} / 100
        </div>
      </div>
    `;
  }

  async shoot() {
    this.setState({
      ...this.state,
      showPreview: true
    });

    const canvas = document.createElement("canvas");
    canvas.width = imageSize;
    canvas.height = imageSize;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(this.videoRef, 0, 0, imageSize, imageSize);

    this.disconnectCamera();
    
    const imageData = ctx.getImageData(0, 0, imageSize, imageSize);

    const image = await Jimp.read(imageData);
    image.quality(this.state.imageQuality);
    const dataURL = await image.getBase64Async("image/jpeg");

    this.setState({
      ...this.state,
      imagePreview: dataURL
    });
  }

  dismissPreview() {
    this.setState(initialState());
    this.connectCamera();
  }
}

render(
  html`
    <${App} />
  `,
  document.getElementById("app")
);
