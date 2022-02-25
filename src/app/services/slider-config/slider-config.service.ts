import { Injectable } from '@angular/core';
import { ScreenSizeService } from '../screen-size/screen-size.service';

@Injectable({
  providedIn: 'root'
})
export class SliderConfigService {

  sliderConfig = {
    grabCursor: true,
    slidesPerView: 1.01,
    spaceBetween: 1,
    centeredSlides: true,
    initialSlide: 0,
    centeredSlidesBounds: true,
    centerInsufficientSlides: true,
    pager: true,
    breakpoints: {
      // when window width is >= 320px
      320: {
        slidesPerView: 1.1,
        spaceBetween: 1
      },
      // when window width is >= 480px
      540: {
        slidesPerView: 1.1,
        spaceBetween: 1
      },
      // when window width is >= 640px
      720: {
        slidesPerView: 2.1,
        spaceBetween: 1
      },
      // when window width is >= 640px
      960: {
        slidesPerView: 2.1,
        spaceBetween: 2
      },
      1140: {
        slidesPerView: 2.1,
        spaceBetween: 2
      },
      1240: {
        slidesPerView: 2.1,
        spaceBetween: 2
      },
      1280: {
        slidesPerView: 2.1,
        spaceBetween: 2
      },
      1440: {
        slidesPerView: 2.41,
        spaceBetween: 2
      },
      1640: {
        slidesPerView: 3.01,
        spaceBetween: 2
      },
      2640: {
        slidesPerView: 3.01,
        spaceBetween: 2
      }
    }
  };

  sliderBannerConfig = {
    grabCursor: true,
    slidesPerView: 1.01,
    spaceBetween: 1,
    centeredSlides: false,
    initialSlide: 0,
    speed: 400,
    autoplay: {
      delay: 3000,
    },
    // loop: true,
    // centeredSlidesBounds: true,
    // centerInsufficientSlides: true,
    pager: true,
    breakpoints: {
      // when window width is >= 320px
      320: {
        slidesPerView: 1.1,
        spaceBetween: 1
      },
      // when window width is >= 480px
      540: {
        slidesPerView: 1.1,
        spaceBetween: 1
      },
      // when window width is >= 640px
      720: {
        slidesPerView: 2.1,
        spaceBetween: 1
      },
      // when window width is >= 640px
      960: {
        slidesPerView: 2.1,
        spaceBetween: 2
      },
      1140: {
        slidesPerView: 2.1,
        spaceBetween: 2
      },
      1240: {
        slidesPerView: 2.1,
        spaceBetween: 2
      },
      1280: {
        slidesPerView: 2.1,
        spaceBetween: 2
      },
      1440: {
        slidesPerView: 2.41,
        spaceBetween: 2
      },
      1640: {
        slidesPerView: 3.01,
        spaceBetween: 2
      },
      2640: {
        slidesPerView: 3.01,
        spaceBetween: 2
      }
    }
  };

  sliderConfig2 = {
    grabCursor: true,
    slidesPerView: 1.5,
    spaceBetween: 1,
    centeredSlides: false,
    initialSlide: 0.5,
    // centeredSlidesBounds: true,
    // centerInsufficientSlides: true,
    pager: false,
    breakpoints: {
      // when window width is >= 320px
      320: {
        slidesPerView: 1.2,
        spaceBetween: 1
      },
      360: {
        slidesPerView: 1.3,
        spaceBetween: 1
      },
      375: {
        slidesPerView: 1.4,
        spaceBetween: 1
      },
      // when window width is >= 480px
      414: {
        slidesPerView: 1.59,
        spaceBetween: 1
      },
      540: {
        slidesPerView: 1.51,
        spaceBetween: 1
      },
      600: {
        slidesPerView: 2.3,
        spaceBetween: 1
      },
      // when window width is >= 640px
      720: {
        slidesPerView: 2.6,
        spaceBetween: 1
      },
      768: {
        slidesPerView: 2.6,
        spaceBetween: 1
      },
      // when window width is >= 640px
      960: {
        slidesPerView: 2.9,
        spaceBetween: 1
      },
      1140: {
        slidesPerView: 2.9,
        spaceBetween: 1
      },
      1240: {
        slidesPerView: 2.9,
        spaceBetween: 1
      },
      1440: {
        slidesPerView: 4.0,
        spaceBetween: 1
      },
      1640: {
        slidesPerView: 4.0,
        spaceBetween: 1
      },
      2640: {
        slidesPerView: 4.0,
        spaceBetween: 1
      }
    }
  };

  exploreSliderConfig = {
    grabCursor: true,
    slidesPerView: 1 + 0.2,
    spaceBetween: 1,
    // centeredSlides: true,
    initialSlide: 0,
    centeredSlidesBounds: false,
    centerInsufficientSlides: false,
    breakpoints: {
      // when window width is >= 320px
      320: {
        slidesPerView: 1 + 0.3,
        spaceBetween: 9
      },
      // when window width is >= 480px
      540: {
        slidesPerView: 1 + 0.3,
        spaceBetween: 9
      },
      // when window width is >= 640px
      720: {
        slidesPerView: 1 + 0.3,
        spaceBetween: 9
      },
      // when window width is >= 640px
      960: {
        slidesPerView: 1 + 0.3,
        spaceBetween: 9
      },
      1140: {
        slidesPerView: 2 + 0.3,
        spaceBetween: 9
      },
      1240: {
        slidesPerView: 3 + 0.3,
        spaceBetween: 9
      },
      1440: {
        slidesPerView: 3 + 0.3,
        spaceBetween: 9
      },
      1640: {
        slidesPerView: 3 + 0.3,
        spaceBetween: 9
      },
      2640: {
        slidesPerView: 3 + 0.3,
        spaceBetween: 9
      }
    }
  };

  sideSliderConfig = {
    grabCursor: true,
    slidesPerView: 1.1,
    spaceBetween: 1,
    initialSlide: 0.5,
    centeredSlides: true,
    centeredSlidesBounds: true,
    centerInsufficientSlides: true,
    pager: false,
    breakpoints: {
      // when window width is >= 320px
      320: {
        slidesPerView: 1.1,
        spaceBetween: 1
      },
      360: {
        slidesPerView: 1.1,
        spaceBetween: 1
      },
      375: {
        slidesPerView: 1.1,
        spaceBetween: 1
      },
      // when window width is >= 480px
      414: {
        slidesPerView: 1.1,
        spaceBetween: 1
      },
      540: {
        slidesPerView: 1.1,
        spaceBetween: 1
      },
      600: {
        slidesPerView: 1.1,
        spaceBetween: 1
      },
      // when window width is >= 640px
      720: {
        slidesPerView: 1.1,
        spaceBetween: 1
      },
      768: {
        slidesPerView: 1.1,
        spaceBetween: 1
      },
      // when window width is >= 640px
      960: {
        slidesPerView: 1.1,
        spaceBetween: 1
      },
      1140: {
        slidesPerView: 1.1,
        spaceBetween: 1
      },
      1240: {
        slidesPerView: 1.1,
        spaceBetween: 1
      },
      1440: {
        slidesPerView: 1.1,
        spaceBetween: 1
      },
      1640: {
        slidesPerView: 1.1,
        spaceBetween: 1
      },
      2640: {
        slidesPerView: 1.1,
        spaceBetween: 1
      }
    }
  };

  constructor(private screenSizeService: ScreenSizeService,) { }

  async getExploreSliderConfig() {
    return this.exploreSliderConfig;
  }

  async getSliderConfig(isSideMenu = false) {
    console.log(isSideMenu);
    this.sliderConfig.centeredSlidesBounds = this.screenSizeService.isDesktop.value;
    return isSideMenu ? this.sideSliderConfig : this.sliderConfig;
  }

  async getSliderConfig2() {
    return this.sliderConfig2;
  }
  async getSliderBannerConfig() {
    return this.sliderBannerConfig;
  }



}
