// This file is auto-generated by ./bin/rails stimulus:manifest:update
// Run that command whenever you add a new controller or create them with
// ./bin/rails generate stimulus controllerName

import { application } from "./application"

import ConfirmController from "./confirm_controller"
application.register("confirm", ConfirmController)

import BtnPreloaderController from "./btn_preloader_controller"
application.register("btn_preloader", BtnPreloaderController)

import NoticesController from "./notices_controller"
application.register("notices", NoticesController)

import ClearFormController from "./clear_form_controller"
application.register('clear-form', ClearFormController);

import FancyboxController from "./fancybox_controller"
application.register('fancybox', FancyboxController);

import PagyInitializerController from "./pagy_initializer_controller";
application.register('pagy_initializer', PagyInitializerController);

import MapController from "./map_controller";
application.register('map', MapController);

import SwiperController from "./swiper_controller";
application.register('swiper', SwiperController);
