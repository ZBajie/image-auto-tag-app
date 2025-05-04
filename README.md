# ImageAutoTagApp

Tag & Shrink

This app helps you easily tag and shrink images for web use. It's designed to make preparing images for websites, blogs, and social media fast and simple.
Features:

    Upload an Image

    Start by uploading the image you want to process.
    Edit Metadata

    Fill in the metadata for the image. The title field is required.
    Add Tags

    Click the Add Tag button to manually add tags to the image.
    Auto-Generated Tags

    Click the Add Auto Tag button to automatically generate tags for the image. This is powered by a TensorFlow model running directly in your browser. It’s not 100% accurate, but it respects your privacy as it operates locally.
    Save Metadata

    Click Save Metadata to store your changes.
    Download Zip

    Download a zip file containing the resized image and its metadata as JSON. The zip will include 3 images in different sizes: 400px, 800px, and 1600px—perfect for web use.
    Download Resized Image

    Click the Download Resized button to download the image resized to 600px.
    Download Resized with Metadata

    Download the resized image with metadata embedded as an XMP file by clicking Download Resized with Metadata.
    Preset Resize Options

    The default resize value is set to 600px but can be adjusted within the metadata editor.

# Code

Its an all frontend app made in angular.
The image analysing tools is not so strong because of that. If the app will be used with a backend present, it would be better to move that to the backend. It should not be so hard to integrate that to the existing code for show and handle the data.

Its an exam project. There is some services and components in the code thats not used in the final output. I will not remove them because maybe someone wants to use it later.

## Angulars own setup notes

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.1.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
