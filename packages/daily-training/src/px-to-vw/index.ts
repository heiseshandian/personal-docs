const content = `
.full-player {
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  height: 100%;
  min-height: 186vw;
  padding-top: 81px;
  overflow-y: auto;
}

.glass-mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: -1;
  background-image: url(~@/images/player/album-bg.png);
  background-position: center;
  background-size: cover;
  transform: translateZ(0) scale(1.2);
  transition-duration: 500ms;
  &::after {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(#000, 0.3);
    content: '';
  }
}

@supports (backdrop-filter: none) {
  .glass-mask {
    &::after {
      backdrop-filter: blur(20px);
    }
  }
}

@supports not (backdrop-filter: none) {
  .glass-mask {
    filter: blur(20px);
  }
}

.body {
  margin-top: 58px;
  padding-right: 27px;
  padding-left: 27px;
  color: #fff;
  .title {
    font-size: 20px;
    line-height: 28px;
  }
  .singer {
    font-size: 16px;
    line-height: 22px;
  }
  .desc {
    color: rgba(#fff, 0.6);
    font-size: 11px;
  }
  .progress {
    margin-top: 41px;
    .bar {
      @bar-height: 3px;
      position: relative;
      width: 100%;
      height: @bar-height;
      background-color: rgba(#fff, 0.09);
      border-radius: @bar-height / 2;
      .elapsed {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: @bar-height;
        background-color: @main-color;
        border-radius: @bar-height / 2;
        transform: scaleX(0);
        transform-origin: 0;
        content: '';
      }
      .pointer {
        @pointer-size: 7px;
        position: absolute;
        top: -(@pointer-size - @bar-height) / 2;
        left: 0;
        width: @pointer-size;
        height: @pointer-size;
        background-color: #fff;
        border-radius: @pointer-size / 2;
        content: '';
      }
    }
    .time {
      justify-content: space-between;
      margin-top: 9px;
      color: rgba(#fff, 0.5);
    }
  }
}

.btn-bg-mixin() {
  background-repeat: no-repeat;
  background-position: center;
  background-size: 24px;
}

.btns {
  justify-content: space-between;
  height: 67px;
  margin-top: 68px;
  margin-right: 27px;
  margin-left: 27px;
  .btn {
    width: 24px;
    height: 67px;
    .btn-bg-mixin();
  }
  .more {
    background-image: url(~@/images/player/btn-more.png);
  }
  .previous {
    background-image: url(~@/images/player/btn-previous.png);
  }
  .play {
    @btn-size: 67px;
    position: relative;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: @btn-size;
    height: @btn-size;
    background-color: @main-color;
    border-radius: @btn-size / 2;
    &::before {
      position: absolute;
      width: 24px;
      height: 24px;
      content: '';
      .btn-bg-mixin();
    }
    &.pausing::before {
      margin-left: 3px;
      background-image: url(~@/images/player/btn-pausing.png);
    }
    &.loading::before {
      background-image: url(~@/images/player/btn-loading.png);
      animation: rotation 1s infinite linear;
    }
    &.playing::before {
      background-image: url(~@/images/player/btn-playing.png);
    }
  }
  .next {
    background-image: url(~@/images/player/btn-next.png);
  }
  .set-ring {
    position: relative;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    &::before {
      position: absolute;
      width: 24px;
      height: 24px;
      background-image: url(~@/images/ring-set.png);
      transform-origin: center top;
      animation: waggle 2s cubic-bezier(0.74, -0.01, 0.25, 1) infinite;
      content: '';
      .btn-bg-mixin();
    }
  }
}

@keyframes waggle {
  45% {
    transform: rotate(16deg);
  }
  30%,
  50% {
    transform: rotate(-16deg);
  }
  55% {
    transform: rotate(8deg);
  }
  60% {
    transform: rotate(-8deg);
  }
  65%,
  100% {
    transform: rotate(0deg);
  }
}

.ring-list-container {
  @container-height: 338px;
  position: absolute;
  bottom: 0;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  height: @container-height;
  overflow: hidden;
  background-color: #fff;
  border-top-left-radius: 22px;
  border-top-right-radius: 22px;
  transform: translate3d(0, @container-height, 0);
  transition-duration: 500ms;
  &.active {
    transform: translate3d(0, 0, 0);
  }
  @tool-bar-height: 30px;
  .tool-bar {
    position: relative;
    display: flex;
    justify-content: center;
    height: @tool-bar-height;
    cursor: pointer;
    &::before {
      position: absolute;
      top: 10px;
      width: 22px;
      height: 2px;
      background-color: #d8d8d8;
      border-radius: 1px;
      content: '';
    }
  }
  .ring-list {
    height: calc(100% - @tool-bar-height);
    padding-right: 20px;
    padding-left: 24px;
    overflow-y: auto;
    transition-duration: 500ms;
    /deep/ .playing,
    /deep/ .loading {
      .ring-meta .name {
        color: @main-color;
      }
    }
  }
}
`;

const pxReg = /([\w-]+):\s*([\d.]+)px/g;

function px2Vw(content: string, width = 360) {
  return content.replace(pxReg, (substr, p1, p2) => {
    if (/font-size/.test(p1)) {
      return substr;
    }
    return substr.replace(
      /([\d.]+)px/,
      `${((Number(p2) / width) * 100).toFixed(6)}vw`,
    );
  });
}

console.log(px2Vw(content));
