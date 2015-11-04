### Rawhide Testing Models
A set of tests for the [rawhide](https://github.com/JrSchild/rawhide) testing framework.

#### Usage
Adjust the `parameters.json` file to your liking. `npm install -g git://github.com/JrSchild/rawhide.git` to install the framework. Clone and cd into this project. `rawhide link` (for now) and then `rawhide run` to start the test.

### Transform
The transform directory runs different tests to see how fast it is to process data after it is inserted.

### TODO:
utils.splitTime options should start with the biggest interval (hour) and also define the last interval (minutes).