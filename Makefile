.PHONY: install test build-apk build-local clean

ANDROID_HOME ?= $(HOME)/Library/Android/sdk
JAVA_HOME ?= /opt/homebrew/opt/openjdk@17
APP_DIR = app

install:
	cd $(APP_DIR) && npm install

test:
	cd $(APP_DIR) && npm test

# Local APK build via expo prebuild + gradle
build-apk:
	cd $(APP_DIR) && ANDROID_HOME=$(ANDROID_HOME) JAVA_HOME=$(JAVA_HOME) npx expo prebuild --platform android --clean
	echo "sdk.dir=$(ANDROID_HOME)" > $(APP_DIR)/android/local.properties
	cd $(APP_DIR)/android && JAVA_HOME=$(JAVA_HOME) ./gradlew assembleRelease
	@echo ""
	@echo "APK: $(APP_DIR)/android/app/build/outputs/apk/release/app-release.apk"

# EAS cloud build (requires expo account)
build-eas:
	cd $(APP_DIR) && npx eas-cli build --platform android --profile preview --non-interactive

clean:
	rm -rf $(APP_DIR)/android $(APP_DIR)/ios $(APP_DIR)/node_modules
