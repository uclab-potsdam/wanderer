# Wanderer

The Wanderer is a framework for telling non-linear and interactive stories with videos and linked data. It's designed for exhibitions and the web. Watch our [tutorial](https://vimeo.com/1039621292) to learn how to set up and use the Wanderer.

![Screenshot of the Xingu Entangled Wanderer](docs/wanderer.png)

## Examples

- [Demo](https://uclab-potsdam.github.io/wanderer-demo)
- [Xingu Entangled](https://uclab-potsdam.github.io/xingu-entangled)
- [this empty Wanderer instance](https://uclab-potsdam.github.io/wanderer)



## Creating your own Wanderer instance

The Wanderer is a static web page and does not depend on a dedicated database or any other backend infrastructure. To create your own Wanderer instance simply copy/download/fork this repository and put the files on a web server.

The files in this branch are prebuild. If you want to contribute to or customise the Wanderer [checkout `main`](https://github.com/uclab-potsdam/wanderer/tree/main).

## Authoring

Edits are always local and only saved inside your web browser. Making changes public to everyone requires exporting the data and replacing the database file `db.json` on your server or repository.

You can make changes to any wanderer instance by appending `/#/authoring` to its url (e.g. [https://uclab-potsdam.github.io/wanderer-demo/#/authoring](https://uclab-potsdam.github.io/wanderer-demo/#/authoring) or [https://uclab-potsdam.github.io/wanderer/#/authoring](https://uclab-potsdam.github.io/wanderer/#/authoring)). This will display a page on which you can enable/disable editing, download the data including all local changes, import a data, and delete all local changes. Any media files referenced in the database but unreachable will also be reported on this page.

Once editing is enabled, the interface offers additional options. The List  button at the top left directs you to a list view of all strories, entities, and images. The ⚙️ next to it brings you to back to `/#/authoring`. Next to the title is the option to switch between modes:

- `public` shows the public and unedited data
- `edit` enables editing. When you first enter this mode a local copy of the public data is made.
- `preview` shows the local and edited data but with editing disabled

### Creating a Stories, Entities, and Images

Select the `edit` mode, go to the list view and make sure the `Stories` type is selected. Add a new story by clicking the ➕ icon. This will create a new story and open the edit form with the following fields:

- `label` the name of the story.¹
- `image` the preview/cover image of the story. 
- `media file` the location of the media file.¹ ²
- `media subtitles` the location of the subtitle file.¹ ²
- `index` if checked the story will be the main entry point to the Wanderer. Exactly one story should be set as index.

Follow the same steps to create `Entities` and `Images`. The respective fields for `Entities` are:

- `label` the name of the entity.¹
- `class` the class (broader category) of the entity. This can be any other entity.
- `description` the description of the entity.
- `url` a list of external links relating to the entity.

The respective fields for `Images` are:

- `label` the name of the image.¹
- `file` the location of the image file.²

To edit or delete `Stories`, `Entities`, or `Images` click the respective buttons next to their label.

¹ language options can be set in the config.  
² you can use full URIs and relative paths or make use of the `shorthands` specified in the config.

### Creating a Story-Diagram

Open a story by clicking on its label in the list view. If you're in the `edit` mode, you'll find a toolbar at the left of the screen and an extendend video timeline at the bottom.

#### Toolbar

| Icon | Description |
| :--- | :---        |
| [<img src="docs/select.png" alt="select entity icon" width="35" />](docs/select.png)  | `Select` entities to rearrange or edit them by double-clicking |
| [<img src="docs/addentity.png" alt="add entity icon" width="35" />](docs/addentity.png)  | `Add entity` from existing lists or add a new entity through entering a label |
| [<img src="docs/addStory.png" alt="add story icon" width="35" />](docs/addStory.png)  | `Add story` to connect your current story-diagram with another story-diagram you have created  |
| [<img src="docs/addImage.png" alt="add image icon" width="35" />](docs/addImage.png)  | `Add image` from existing lists or add a new image to your diagram |
| [<img src="docs/addEdge.png" alt="add edge icon" width="35" />](docs/addEdge.png)  | `Add edge` by selecting two entities you want to connect |
| [<img src="docs/blur.png" alt="blur" width="35" />](docs/blur.png)  | `Blur` keyframe: select any element to mark the point in time at which the selected element is blurred. |
| [<img src="docs/default.png" alt="default" width="35" />](docs/default.png)  | `Default` keyframe: select any element to mark the point in time at which the selected element is displayed normally (neither blurred nor highlighted).|
| [<img src="docs/highlight.png" alt="highlight" width="35" />](docs/highlight.png)  | `Highlight` keyframe: select any element to mark the point in time at which the selected element is highlighted.|
| [<img src="docs/frame.png" alt="frame" width="35" />](docs/frame.png)  | The `frame` tool allows you to define an image section that is focused on at the specific point in time|
| [<img src="docs/download.png" alt="download date" width="35" />](docs/download.png)  | `Download data`|


#### Coupling Diagram and Video


### Publishing changes

- Download `db.json`
- Check all media resources are reachable, unreachable media files are reported under `/#/authoring`
- Replace the existing `db.json` in the repository / on the server.

## Hosting

To host the wanderer put the files in this repository, your customised `db.json` and any media files on a web server.

### GitHub

You can host the wanderer directly through [GitHub pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site). But there are [limits on file sizes](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github) which are easily exceeded when using video files.

You can host your media files on another web server. Make sure to enable [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

Alternatively you can create small proxy video files with lower resolution and reduced quality and replace them with the origial files once you're ready to move to another server.

### Local

You can [create a local webserver](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Tools_and_setup/set_up_a_local_testing_server) to run the wanderer on your computer.

## Directory Structure
- `/content/` this is the default folder for all media files such as videos, images, subtitles, the about text and the favicon. You can change the name of this directory if you update the config section in the `db.json` file accordingly.
- `/content/about.md` this is the default file for the content of the about text accessible thorugh the ℹ icon in the interface. It's a [Markdown file](https://www.markdownguide.org/getting-started/) and can be edited in any text editor or directly on GitHub. You can specify the file name in the config section of the `db.json` file and specifiy localized about files (e.g. about_de.md) to support multiple languages.
- `/docs/` all images referenced in this `README.md`
- `/wanderer/` this folder contains the necessary scripts, stylesheets, etc. to run the Wanderer. Best not to change anything here. Those files are minified and barely readable, checkout the `main` branch containing the source files if you want to change how the wanderer functions and looks.

- `.gitignore` prevents tracking hidden files in this directory. [learn more](https://git-scm.com/docs/gitignore)
- `LICENSE` the license (MIT) under which the Wanderer is made available 
- `README.md` this file
- `db.json` the database file. contains a configuration section (more on that below) as well as all saved nodes and edges as well as a last modified timestamp.
- `index.html` the website. It’s very empty as the page will be dynamically generated using the files in the `wanderer` directory 


## The Database File (db.json)

The `db.json` stores the wanderer configuration and data. At it’s root it has four fields:

```
{
  "config": { … },
  "nodes": { … },
  "edges": [ … ],
  "exported": 0
}
```

The fields `nodes`, `edges`, and `exported` will be updated through the authoring mode. Editing them in the file directly is possible but usually not necessary.

### Config

The config section allows you to customize your wanderer instance. You can change them at any point but it is usually a good idea to go through them when setting up a new instance.

```
{
  "config": {
    "languages": {
```

You can specify language options for text (i.e. names of entities and edges and subtitles) and for videos.

```
      "text": [
        {
          "key": "en",
          "label": "English",
          "short": "en"
        },
        {
          "key": "universal",
          "label": "universal",
          "selectable": false,
          "short": "♥"
        }
      ],
```

`text` takes an array of options. Each option requires further attributes:

- `key` the field name under which text is stored in this database file.
- `label` the label under which the language option is presented to the user.
- `short` a shortened label displayed in form elements in the authoring mode
- `selectable` optional, set to `false` if you don’t want to show the language options in the interface. Text stored in a non-selectable language might still be displayed if the label is not translated into the selected language.

```
      "video": [
        {
          "key": "universal",
          "label": "Universal",
          "short": "universal"
        }
      ]
    },
```

`video` takes an array of options. Each option requires further attributes:

- `key` the field name under which text is stored in this database file.
- `label` the label under which the language option is presented to the user.
- `short` a shortened label displayed in form elements in the authoring mode

```
    "shorthands": {
      "default": "./files/"
    },
```

Shorthands are used for storing and resolving media URIs. This makes it easier to move those files between different domains or switching between local and remote resources.

In the above example, a file `image.png` in the `./files/` folder would be referenced in this database file as `default:image.png`. If you move the media resources to a dedicated server you’ll only need to update the shorthand.

You can provide additional fallbacks by adding additional key/value pairs to the shorthands object.

```
    "defaultShorthand": "default",
```

The defaultShorthand is used in authoring for local images that are added to the Wanderer through drag and drop. The value needs to be one of the keys of the `shorthands` object.

```
    "kiosk": false,
```

Set `kiosk` to `true` for exhibition environments. This disables all external links, hides the picture in picture option, as well as the play/pause and mute/unmute buttons.

```
    "about": {
      "en": "local:about.md"
    }
```
Specify the path to the about file. Add additional key/value pairs for additional languages.

```
  },
  …
}
```

## Updating the Wanderer

To Update the wanderer copy the replace the `index.html` and `assets` with the ones from the latest version. If you made any changes to your `index.html` make sure to apply them again to the updated `index.html`

## File Formats

For videos and images make sure to use formats that are widely supported across browsers.

Subtitles need to be provided in [SubRip file format](https://en.wikipedia.org/wiki/SubRip#Format) as `.srt` files.
