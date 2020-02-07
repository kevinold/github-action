module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(104);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 1:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const childProcess = __webpack_require__(129);
const path = __webpack_require__(622);
const util_1 = __webpack_require__(669);
const ioUtil = __webpack_require__(672);
const exec = util_1.promisify(childProcess.exec);
/**
 * Copies a file or folder.
 * Based off of shelljs - https://github.com/shelljs/shelljs/blob/9237f66c52e5daa40458f94f9565e18e8132f5a6/src/cp.js
 *
 * @param     source    source path
 * @param     dest      destination path
 * @param     options   optional. See CopyOptions.
 */
function cp(source, dest, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const { force, recursive } = readCopyOptions(options);
        const destStat = (yield ioUtil.exists(dest)) ? yield ioUtil.stat(dest) : null;
        // Dest is an existing file, but not forcing
        if (destStat && destStat.isFile() && !force) {
            return;
        }
        // If dest is an existing directory, should copy inside.
        const newDest = destStat && destStat.isDirectory()
            ? path.join(dest, path.basename(source))
            : dest;
        if (!(yield ioUtil.exists(source))) {
            throw new Error(`no such file or directory: ${source}`);
        }
        const sourceStat = yield ioUtil.stat(source);
        if (sourceStat.isDirectory()) {
            if (!recursive) {
                throw new Error(`Failed to copy. ${source} is a directory, but tried to copy without recursive flag.`);
            }
            else {
                yield cpDirRecursive(source, newDest, 0, force);
            }
        }
        else {
            if (path.relative(source, newDest) === '') {
                // a file cannot be copied to itself
                throw new Error(`'${newDest}' and '${source}' are the same file`);
            }
            yield copyFile(source, newDest, force);
        }
    });
}
exports.cp = cp;
/**
 * Moves a path.
 *
 * @param     source    source path
 * @param     dest      destination path
 * @param     options   optional. See MoveOptions.
 */
function mv(source, dest, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield ioUtil.exists(dest)) {
            let destExists = true;
            if (yield ioUtil.isDirectory(dest)) {
                // If dest is directory copy src into dest
                dest = path.join(dest, path.basename(source));
                destExists = yield ioUtil.exists(dest);
            }
            if (destExists) {
                if (options.force == null || options.force) {
                    yield rmRF(dest);
                }
                else {
                    throw new Error('Destination already exists');
                }
            }
        }
        yield mkdirP(path.dirname(dest));
        yield ioUtil.rename(source, dest);
    });
}
exports.mv = mv;
/**
 * Remove a path recursively with force
 *
 * @param inputPath path to remove
 */
function rmRF(inputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ioUtil.IS_WINDOWS) {
            // Node doesn't provide a delete operation, only an unlink function. This means that if the file is being used by another
            // program (e.g. antivirus), it won't be deleted. To address this, we shell out the work to rd/del.
            try {
                if (yield ioUtil.isDirectory(inputPath, true)) {
                    yield exec(`rd /s /q "${inputPath}"`);
                }
                else {
                    yield exec(`del /f /a "${inputPath}"`);
                }
            }
            catch (err) {
                // if you try to delete a file that doesn't exist, desired result is achieved
                // other errors are valid
                if (err.code !== 'ENOENT')
                    throw err;
            }
            // Shelling out fails to remove a symlink folder with missing source, this unlink catches that
            try {
                yield ioUtil.unlink(inputPath);
            }
            catch (err) {
                // if you try to delete a file that doesn't exist, desired result is achieved
                // other errors are valid
                if (err.code !== 'ENOENT')
                    throw err;
            }
        }
        else {
            let isDir = false;
            try {
                isDir = yield ioUtil.isDirectory(inputPath);
            }
            catch (err) {
                // if you try to delete a file that doesn't exist, desired result is achieved
                // other errors are valid
                if (err.code !== 'ENOENT')
                    throw err;
                return;
            }
            if (isDir) {
                yield exec(`rm -rf "${inputPath}"`);
            }
            else {
                yield ioUtil.unlink(inputPath);
            }
        }
    });
}
exports.rmRF = rmRF;
/**
 * Make a directory.  Creates the full path with folders in between
 * Will throw if it fails
 *
 * @param   fsPath        path to create
 * @returns Promise<void>
 */
function mkdirP(fsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ioUtil.mkdirP(fsPath);
    });
}
exports.mkdirP = mkdirP;
/**
 * Returns path of a tool had the tool actually been invoked.  Resolves via paths.
 * If you check and the tool does not exist, it will throw.
 *
 * @param     tool              name of the tool
 * @param     check             whether to check if tool exists
 * @returns   Promise<string>   path to tool
 */
function which(tool, check) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!tool) {
            throw new Error("parameter 'tool' is required");
        }
        // recursive when check=true
        if (check) {
            const result = yield which(tool, false);
            if (!result) {
                if (ioUtil.IS_WINDOWS) {
                    throw new Error(`Unable to locate executable file: ${tool}. Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable. Also verify the file has a valid extension for an executable file.`);
                }
                else {
                    throw new Error(`Unable to locate executable file: ${tool}. Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable. Also check the file mode to verify the file is executable.`);
                }
            }
        }
        try {
            // build the list of extensions to try
            const extensions = [];
            if (ioUtil.IS_WINDOWS && process.env.PATHEXT) {
                for (const extension of process.env.PATHEXT.split(path.delimiter)) {
                    if (extension) {
                        extensions.push(extension);
                    }
                }
            }
            // if it's rooted, return it if exists. otherwise return empty.
            if (ioUtil.isRooted(tool)) {
                const filePath = yield ioUtil.tryGetExecutablePath(tool, extensions);
                if (filePath) {
                    return filePath;
                }
                return '';
            }
            // if any path separators, return empty
            if (tool.includes('/') || (ioUtil.IS_WINDOWS && tool.includes('\\'))) {
                return '';
            }
            // build the list of directories
            //
            // Note, technically "where" checks the current directory on Windows. From a toolkit perspective,
            // it feels like we should not do this. Checking the current directory seems like more of a use
            // case of a shell, and the which() function exposed by the toolkit should strive for consistency
            // across platforms.
            const directories = [];
            if (process.env.PATH) {
                for (const p of process.env.PATH.split(path.delimiter)) {
                    if (p) {
                        directories.push(p);
                    }
                }
            }
            // return the first match
            for (const directory of directories) {
                const filePath = yield ioUtil.tryGetExecutablePath(directory + path.sep + tool, extensions);
                if (filePath) {
                    return filePath;
                }
            }
            return '';
        }
        catch (err) {
            throw new Error(`which failed with message ${err.message}`);
        }
    });
}
exports.which = which;
function readCopyOptions(options) {
    const force = options.force == null ? true : options.force;
    const recursive = Boolean(options.recursive);
    return { force, recursive };
}
function cpDirRecursive(sourceDir, destDir, currentDepth, force) {
    return __awaiter(this, void 0, void 0, function* () {
        // Ensure there is not a run away recursive copy
        if (currentDepth >= 255)
            return;
        currentDepth++;
        yield mkdirP(destDir);
        const files = yield ioUtil.readdir(sourceDir);
        for (const fileName of files) {
            const srcFile = `${sourceDir}/${fileName}`;
            const destFile = `${destDir}/${fileName}`;
            const srcFileStat = yield ioUtil.lstat(srcFile);
            if (srcFileStat.isDirectory()) {
                // Recurse
                yield cpDirRecursive(srcFile, destFile, currentDepth, force);
            }
            else {
                yield copyFile(srcFile, destFile, force);
            }
        }
        // Change the mode for the newly created directory
        yield ioUtil.chmod(destDir, (yield ioUtil.stat(sourceDir)).mode);
    });
}
// Buffered file copy
function copyFile(srcFile, destFile, force) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((yield ioUtil.lstat(srcFile)).isSymbolicLink()) {
            // unlink/re-link it
            try {
                yield ioUtil.lstat(destFile);
                yield ioUtil.unlink(destFile);
            }
            catch (e) {
                // Try to override file permission
                if (e.code === 'EPERM') {
                    yield ioUtil.chmod(destFile, '0666');
                    yield ioUtil.unlink(destFile);
                }
                // other errors = it doesn't exist, no work to do
            }
            // Copy over symlink
            const symlinkFull = yield ioUtil.readlink(srcFile);
            yield ioUtil.symlink(symlinkFull, destFile, ioUtil.IS_WINDOWS ? 'junction' : null);
        }
        else if (!(yield ioUtil.exists(destFile)) || force) {
            yield ioUtil.copyFile(srcFile, destFile);
        }
    });
}
//# sourceMappingURL=io.js.map

/***/ }),

/***/ 9:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = __webpack_require__(87);
const events = __webpack_require__(614);
const child = __webpack_require__(129);
/* eslint-disable @typescript-eslint/unbound-method */
const IS_WINDOWS = process.platform === 'win32';
/*
 * Class for running command line tools. Handles quoting and arg parsing in a platform agnostic way.
 */
class ToolRunner extends events.EventEmitter {
    constructor(toolPath, args, options) {
        super();
        if (!toolPath) {
            throw new Error("Parameter 'toolPath' cannot be null or empty.");
        }
        this.toolPath = toolPath;
        this.args = args || [];
        this.options = options || {};
    }
    _debug(message) {
        if (this.options.listeners && this.options.listeners.debug) {
            this.options.listeners.debug(message);
        }
    }
    _getCommandString(options, noPrefix) {
        const toolPath = this._getSpawnFileName();
        const args = this._getSpawnArgs(options);
        let cmd = noPrefix ? '' : '[command]'; // omit prefix when piped to a second tool
        if (IS_WINDOWS) {
            // Windows + cmd file
            if (this._isCmdFile()) {
                cmd += toolPath;
                for (const a of args) {
                    cmd += ` ${a}`;
                }
            }
            // Windows + verbatim
            else if (options.windowsVerbatimArguments) {
                cmd += `"${toolPath}"`;
                for (const a of args) {
                    cmd += ` ${a}`;
                }
            }
            // Windows (regular)
            else {
                cmd += this._windowsQuoteCmdArg(toolPath);
                for (const a of args) {
                    cmd += ` ${this._windowsQuoteCmdArg(a)}`;
                }
            }
        }
        else {
            // OSX/Linux - this can likely be improved with some form of quoting.
            // creating processes on Unix is fundamentally different than Windows.
            // on Unix, execvp() takes an arg array.
            cmd += toolPath;
            for (const a of args) {
                cmd += ` ${a}`;
            }
        }
        return cmd;
    }
    _processLineBuffer(data, strBuffer, onLine) {
        try {
            let s = strBuffer + data.toString();
            let n = s.indexOf(os.EOL);
            while (n > -1) {
                const line = s.substring(0, n);
                onLine(line);
                // the rest of the string ...
                s = s.substring(n + os.EOL.length);
                n = s.indexOf(os.EOL);
            }
            strBuffer = s;
        }
        catch (err) {
            // streaming lines to console is best effort.  Don't fail a build.
            this._debug(`error processing line. Failed with error ${err}`);
        }
    }
    _getSpawnFileName() {
        if (IS_WINDOWS) {
            if (this._isCmdFile()) {
                return process.env['COMSPEC'] || 'cmd.exe';
            }
        }
        return this.toolPath;
    }
    _getSpawnArgs(options) {
        if (IS_WINDOWS) {
            if (this._isCmdFile()) {
                let argline = `/D /S /C "${this._windowsQuoteCmdArg(this.toolPath)}`;
                for (const a of this.args) {
                    argline += ' ';
                    argline += options.windowsVerbatimArguments
                        ? a
                        : this._windowsQuoteCmdArg(a);
                }
                argline += '"';
                return [argline];
            }
        }
        return this.args;
    }
    _endsWith(str, end) {
        return str.endsWith(end);
    }
    _isCmdFile() {
        const upperToolPath = this.toolPath.toUpperCase();
        return (this._endsWith(upperToolPath, '.CMD') ||
            this._endsWith(upperToolPath, '.BAT'));
    }
    _windowsQuoteCmdArg(arg) {
        // for .exe, apply the normal quoting rules that libuv applies
        if (!this._isCmdFile()) {
            return this._uvQuoteCmdArg(arg);
        }
        // otherwise apply quoting rules specific to the cmd.exe command line parser.
        // the libuv rules are generic and are not designed specifically for cmd.exe
        // command line parser.
        //
        // for a detailed description of the cmd.exe command line parser, refer to
        // http://stackoverflow.com/questions/4094699/how-does-the-windows-command-interpreter-cmd-exe-parse-scripts/7970912#7970912
        // need quotes for empty arg
        if (!arg) {
            return '""';
        }
        // determine whether the arg needs to be quoted
        const cmdSpecialChars = [
            ' ',
            '\t',
            '&',
            '(',
            ')',
            '[',
            ']',
            '{',
            '}',
            '^',
            '=',
            ';',
            '!',
            "'",
            '+',
            ',',
            '`',
            '~',
            '|',
            '<',
            '>',
            '"'
        ];
        let needsQuotes = false;
        for (const char of arg) {
            if (cmdSpecialChars.some(x => x === char)) {
                needsQuotes = true;
                break;
            }
        }
        // short-circuit if quotes not needed
        if (!needsQuotes) {
            return arg;
        }
        // the following quoting rules are very similar to the rules that by libuv applies.
        //
        // 1) wrap the string in quotes
        //
        // 2) double-up quotes - i.e. " => ""
        //
        //    this is different from the libuv quoting rules. libuv replaces " with \", which unfortunately
        //    doesn't work well with a cmd.exe command line.
        //
        //    note, replacing " with "" also works well if the arg is passed to a downstream .NET console app.
        //    for example, the command line:
        //          foo.exe "myarg:""my val"""
        //    is parsed by a .NET console app into an arg array:
        //          [ "myarg:\"my val\"" ]
        //    which is the same end result when applying libuv quoting rules. although the actual
        //    command line from libuv quoting rules would look like:
        //          foo.exe "myarg:\"my val\""
        //
        // 3) double-up slashes that precede a quote,
        //    e.g.  hello \world    => "hello \world"
        //          hello\"world    => "hello\\""world"
        //          hello\\"world   => "hello\\\\""world"
        //          hello world\    => "hello world\\"
        //
        //    technically this is not required for a cmd.exe command line, or the batch argument parser.
        //    the reasons for including this as a .cmd quoting rule are:
        //
        //    a) this is optimized for the scenario where the argument is passed from the .cmd file to an
        //       external program. many programs (e.g. .NET console apps) rely on the slash-doubling rule.
        //
        //    b) it's what we've been doing previously (by deferring to node default behavior) and we
        //       haven't heard any complaints about that aspect.
        //
        // note, a weakness of the quoting rules chosen here, is that % is not escaped. in fact, % cannot be
        // escaped when used on the command line directly - even though within a .cmd file % can be escaped
        // by using %%.
        //
        // the saving grace is, on the command line, %var% is left as-is if var is not defined. this contrasts
        // the line parsing rules within a .cmd file, where if var is not defined it is replaced with nothing.
        //
        // one option that was explored was replacing % with ^% - i.e. %var% => ^%var^%. this hack would
        // often work, since it is unlikely that var^ would exist, and the ^ character is removed when the
        // variable is used. the problem, however, is that ^ is not removed when %* is used to pass the args
        // to an external program.
        //
        // an unexplored potential solution for the % escaping problem, is to create a wrapper .cmd file.
        // % can be escaped within a .cmd file.
        let reverse = '"';
        let quoteHit = true;
        for (let i = arg.length; i > 0; i--) {
            // walk the string in reverse
            reverse += arg[i - 1];
            if (quoteHit && arg[i - 1] === '\\') {
                reverse += '\\'; // double the slash
            }
            else if (arg[i - 1] === '"') {
                quoteHit = true;
                reverse += '"'; // double the quote
            }
            else {
                quoteHit = false;
            }
        }
        reverse += '"';
        return reverse
            .split('')
            .reverse()
            .join('');
    }
    _uvQuoteCmdArg(arg) {
        // Tool runner wraps child_process.spawn() and needs to apply the same quoting as
        // Node in certain cases where the undocumented spawn option windowsVerbatimArguments
        // is used.
        //
        // Since this function is a port of quote_cmd_arg from Node 4.x (technically, lib UV,
        // see https://github.com/nodejs/node/blob/v4.x/deps/uv/src/win/process.c for details),
        // pasting copyright notice from Node within this function:
        //
        //      Copyright Joyent, Inc. and other Node contributors. All rights reserved.
        //
        //      Permission is hereby granted, free of charge, to any person obtaining a copy
        //      of this software and associated documentation files (the "Software"), to
        //      deal in the Software without restriction, including without limitation the
        //      rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
        //      sell copies of the Software, and to permit persons to whom the Software is
        //      furnished to do so, subject to the following conditions:
        //
        //      The above copyright notice and this permission notice shall be included in
        //      all copies or substantial portions of the Software.
        //
        //      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        //      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        //      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        //      AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        //      LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
        //      FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
        //      IN THE SOFTWARE.
        if (!arg) {
            // Need double quotation for empty argument
            return '""';
        }
        if (!arg.includes(' ') && !arg.includes('\t') && !arg.includes('"')) {
            // No quotation needed
            return arg;
        }
        if (!arg.includes('"') && !arg.includes('\\')) {
            // No embedded double quotes or backslashes, so I can just wrap
            // quote marks around the whole thing.
            return `"${arg}"`;
        }
        // Expected input/output:
        //   input : hello"world
        //   output: "hello\"world"
        //   input : hello""world
        //   output: "hello\"\"world"
        //   input : hello\world
        //   output: hello\world
        //   input : hello\\world
        //   output: hello\\world
        //   input : hello\"world
        //   output: "hello\\\"world"
        //   input : hello\\"world
        //   output: "hello\\\\\"world"
        //   input : hello world\
        //   output: "hello world\\" - note the comment in libuv actually reads "hello world\"
        //                             but it appears the comment is wrong, it should be "hello world\\"
        let reverse = '"';
        let quoteHit = true;
        for (let i = arg.length; i > 0; i--) {
            // walk the string in reverse
            reverse += arg[i - 1];
            if (quoteHit && arg[i - 1] === '\\') {
                reverse += '\\';
            }
            else if (arg[i - 1] === '"') {
                quoteHit = true;
                reverse += '\\';
            }
            else {
                quoteHit = false;
            }
        }
        reverse += '"';
        return reverse
            .split('')
            .reverse()
            .join('');
    }
    _cloneExecOptions(options) {
        options = options || {};
        const result = {
            cwd: options.cwd || process.cwd(),
            env: options.env || process.env,
            silent: options.silent || false,
            windowsVerbatimArguments: options.windowsVerbatimArguments || false,
            failOnStdErr: options.failOnStdErr || false,
            ignoreReturnCode: options.ignoreReturnCode || false,
            delay: options.delay || 10000
        };
        result.outStream = options.outStream || process.stdout;
        result.errStream = options.errStream || process.stderr;
        return result;
    }
    _getSpawnOptions(options, toolPath) {
        options = options || {};
        const result = {};
        result.cwd = options.cwd;
        result.env = options.env;
        result['windowsVerbatimArguments'] =
            options.windowsVerbatimArguments || this._isCmdFile();
        if (options.windowsVerbatimArguments) {
            result.argv0 = `"${toolPath}"`;
        }
        return result;
    }
    /**
     * Exec a tool.
     * Output will be streamed to the live console.
     * Returns promise with return code
     *
     * @param     tool     path to tool to exec
     * @param     options  optional exec options.  See ExecOptions
     * @returns   number
     */
    exec() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this._debug(`exec tool: ${this.toolPath}`);
                this._debug('arguments:');
                for (const arg of this.args) {
                    this._debug(`   ${arg}`);
                }
                const optionsNonNull = this._cloneExecOptions(this.options);
                if (!optionsNonNull.silent && optionsNonNull.outStream) {
                    optionsNonNull.outStream.write(this._getCommandString(optionsNonNull) + os.EOL);
                }
                const state = new ExecState(optionsNonNull, this.toolPath);
                state.on('debug', (message) => {
                    this._debug(message);
                });
                const fileName = this._getSpawnFileName();
                const cp = child.spawn(fileName, this._getSpawnArgs(optionsNonNull), this._getSpawnOptions(this.options, fileName));
                const stdbuffer = '';
                if (cp.stdout) {
                    cp.stdout.on('data', (data) => {
                        if (this.options.listeners && this.options.listeners.stdout) {
                            this.options.listeners.stdout(data);
                        }
                        if (!optionsNonNull.silent && optionsNonNull.outStream) {
                            optionsNonNull.outStream.write(data);
                        }
                        this._processLineBuffer(data, stdbuffer, (line) => {
                            if (this.options.listeners && this.options.listeners.stdline) {
                                this.options.listeners.stdline(line);
                            }
                        });
                    });
                }
                const errbuffer = '';
                if (cp.stderr) {
                    cp.stderr.on('data', (data) => {
                        state.processStderr = true;
                        if (this.options.listeners && this.options.listeners.stderr) {
                            this.options.listeners.stderr(data);
                        }
                        if (!optionsNonNull.silent &&
                            optionsNonNull.errStream &&
                            optionsNonNull.outStream) {
                            const s = optionsNonNull.failOnStdErr
                                ? optionsNonNull.errStream
                                : optionsNonNull.outStream;
                            s.write(data);
                        }
                        this._processLineBuffer(data, errbuffer, (line) => {
                            if (this.options.listeners && this.options.listeners.errline) {
                                this.options.listeners.errline(line);
                            }
                        });
                    });
                }
                cp.on('error', (err) => {
                    state.processError = err.message;
                    state.processExited = true;
                    state.processClosed = true;
                    state.CheckComplete();
                });
                cp.on('exit', (code) => {
                    state.processExitCode = code;
                    state.processExited = true;
                    this._debug(`Exit code ${code} received from tool '${this.toolPath}'`);
                    state.CheckComplete();
                });
                cp.on('close', (code) => {
                    state.processExitCode = code;
                    state.processExited = true;
                    state.processClosed = true;
                    this._debug(`STDIO streams have closed for tool '${this.toolPath}'`);
                    state.CheckComplete();
                });
                state.on('done', (error, exitCode) => {
                    if (stdbuffer.length > 0) {
                        this.emit('stdline', stdbuffer);
                    }
                    if (errbuffer.length > 0) {
                        this.emit('errline', errbuffer);
                    }
                    cp.removeAllListeners();
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(exitCode);
                    }
                });
            });
        });
    }
}
exports.ToolRunner = ToolRunner;
/**
 * Convert an arg string to an array of args. Handles escaping
 *
 * @param    argString   string of arguments
 * @returns  string[]    array of arguments
 */
function argStringToArray(argString) {
    const args = [];
    let inQuotes = false;
    let escaped = false;
    let arg = '';
    function append(c) {
        // we only escape double quotes.
        if (escaped && c !== '"') {
            arg += '\\';
        }
        arg += c;
        escaped = false;
    }
    for (let i = 0; i < argString.length; i++) {
        const c = argString.charAt(i);
        if (c === '"') {
            if (!escaped) {
                inQuotes = !inQuotes;
            }
            else {
                append(c);
            }
            continue;
        }
        if (c === '\\' && escaped) {
            append(c);
            continue;
        }
        if (c === '\\' && inQuotes) {
            escaped = true;
            continue;
        }
        if (c === ' ' && !inQuotes) {
            if (arg.length > 0) {
                args.push(arg);
                arg = '';
            }
            continue;
        }
        append(c);
    }
    if (arg.length > 0) {
        args.push(arg.trim());
    }
    return args;
}
exports.argStringToArray = argStringToArray;
class ExecState extends events.EventEmitter {
    constructor(options, toolPath) {
        super();
        this.processClosed = false; // tracks whether the process has exited and stdio is closed
        this.processError = '';
        this.processExitCode = 0;
        this.processExited = false; // tracks whether the process has exited
        this.processStderr = false; // tracks whether stderr was written to
        this.delay = 10000; // 10 seconds
        this.done = false;
        this.timeout = null;
        if (!toolPath) {
            throw new Error('toolPath must not be empty');
        }
        this.options = options;
        this.toolPath = toolPath;
        if (options.delay) {
            this.delay = options.delay;
        }
    }
    CheckComplete() {
        if (this.done) {
            return;
        }
        if (this.processClosed) {
            this._setResult();
        }
        else if (this.processExited) {
            this.timeout = setTimeout(ExecState.HandleTimeout, this.delay, this);
        }
    }
    _debug(message) {
        this.emit('debug', message);
    }
    _setResult() {
        // determine whether there is an error
        let error;
        if (this.processExited) {
            if (this.processError) {
                error = new Error(`There was an error when attempting to execute the process '${this.toolPath}'. This may indicate the process failed to start. Error: ${this.processError}`);
            }
            else if (this.processExitCode !== 0 && !this.options.ignoreReturnCode) {
                error = new Error(`The process '${this.toolPath}' failed with exit code ${this.processExitCode}`);
            }
            else if (this.processStderr && this.options.failOnStdErr) {
                error = new Error(`The process '${this.toolPath}' failed because one or more lines were written to the STDERR stream`);
            }
        }
        // clear the timeout
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.done = true;
        this.emit('done', error, this.processExitCode);
    }
    static HandleTimeout(state) {
        if (state.done) {
            return;
        }
        if (!state.processClosed && state.processExited) {
            const message = `The STDIO streams did not close within ${state.delay /
                1000} seconds of the exit event from process '${state.toolPath}'. This may indicate a child process inherited the STDIO streams and has not yet exited.`;
            state._debug(message);
        }
        state._setResult();
    }
}
//# sourceMappingURL=toolrunner.js.map

/***/ }),

/***/ 11:
/***/ (function(module) {

// Returns a wrapper function that returns a wrapped callback
// The wrapper function should do some stuff, and return a
// presumably different callback function.
// This makes sure that own properties are retained, so that
// decorations and such are not lost along the way.
module.exports = wrappy
function wrappy (fn, cb) {
  if (fn && cb) return wrappy(fn)(cb)

  if (typeof fn !== 'function')
    throw new TypeError('need wrapper function')

  Object.keys(fn).forEach(function (k) {
    wrapper[k] = fn[k]
  })

  return wrapper

  function wrapper() {
    var args = new Array(arguments.length)
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i]
    }
    var ret = fn.apply(this, args)
    var cb = args[args.length-1]
    if (typeof ret === 'function' && ret !== cb) {
      Object.keys(cb).forEach(function (k) {
        ret[k] = cb[k]
      })
    }
    return ret
  }
}


/***/ }),

/***/ 16:
/***/ (function(module) {

module.exports = require("tls");

/***/ }),

/***/ 18:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const net = __webpack_require__(631);

class TimeoutError extends Error {
	constructor(threshold, event) {
		super(`Timeout awaiting '${event}' for ${threshold}ms`);
		this.name = 'TimeoutError';
		this.code = 'ETIMEDOUT';
		this.event = event;
	}
}

const reentry = Symbol('reentry');

const noop = () => {};

module.exports = (request, delays, options) => {
	/* istanbul ignore next: this makes sure timed-out isn't called twice */
	if (request[reentry]) {
		return;
	}

	request[reentry] = true;

	let stopNewTimeouts = false;

	const addTimeout = (delay, callback, ...args) => {
		// An error had been thrown before. Going further would result in uncaught errors.
		// See https://github.com/sindresorhus/got/issues/631#issuecomment-435675051
		if (stopNewTimeouts) {
			return noop;
		}

		// Event loop order is timers, poll, immediates.
		// The timed event may emit during the current tick poll phase, so
		// defer calling the handler until the poll phase completes.
		let immediate;
		const timeout = setTimeout(() => {
			immediate = setImmediate(callback, delay, ...args);
			/* istanbul ignore next: added in node v9.7.0 */
			if (immediate.unref) {
				immediate.unref();
			}
		}, delay);

		/* istanbul ignore next: in order to support electron renderer */
		if (timeout.unref) {
			timeout.unref();
		}

		const cancel = () => {
			clearTimeout(timeout);
			clearImmediate(immediate);
		};

		cancelers.push(cancel);

		return cancel;
	};

	const {host, hostname} = options;
	const timeoutHandler = (delay, event) => {
		request.emit('error', new TimeoutError(delay, event));
		request.once('error', () => {}); // Ignore the `socket hung up` error made by request.abort()

		request.abort();
	};

	const cancelers = [];
	const cancelTimeouts = () => {
		stopNewTimeouts = true;
		cancelers.forEach(cancelTimeout => cancelTimeout());
	};

	request.once('error', cancelTimeouts);
	request.once('response', response => {
		response.once('end', cancelTimeouts);
	});

	if (delays.request !== undefined) {
		addTimeout(delays.request, timeoutHandler, 'request');
	}

	if (delays.socket !== undefined) {
		const socketTimeoutHandler = () => {
			timeoutHandler(delays.socket, 'socket');
		};

		request.setTimeout(delays.socket, socketTimeoutHandler);

		// `request.setTimeout(0)` causes a memory leak.
		// We can just remove the listener and forget about the timer - it's unreffed.
		// See https://github.com/sindresorhus/got/issues/690
		cancelers.push(() => request.removeListener('timeout', socketTimeoutHandler));
	}

	if (delays.lookup !== undefined && !request.socketPath && !net.isIP(hostname || host)) {
		request.once('socket', socket => {
			/* istanbul ignore next: hard to test */
			if (socket.connecting) {
				const cancelTimeout = addTimeout(delays.lookup, timeoutHandler, 'lookup');
				socket.once('lookup', cancelTimeout);
			}
		});
	}

	if (delays.connect !== undefined) {
		request.once('socket', socket => {
			/* istanbul ignore next: hard to test */
			if (socket.connecting) {
				const timeConnect = () => addTimeout(delays.connect, timeoutHandler, 'connect');

				if (request.socketPath || net.isIP(hostname || host)) {
					socket.once('connect', timeConnect());
				} else {
					socket.once('lookup', error => {
						if (error === null) {
							socket.once('connect', timeConnect());
						}
					});
				}
			}
		});
	}

	if (delays.secureConnect !== undefined && options.protocol === 'https:') {
		request.once('socket', socket => {
			/* istanbul ignore next: hard to test */
			if (socket.connecting) {
				socket.once('connect', () => {
					const cancelTimeout = addTimeout(delays.secureConnect, timeoutHandler, 'secureConnect');
					socket.once('secureConnect', cancelTimeout);
				});
			}
		});
	}

	if (delays.send !== undefined) {
		request.once('socket', socket => {
			const timeRequest = () => addTimeout(delays.send, timeoutHandler, 'send');
			/* istanbul ignore next: hard to test */
			if (socket.connecting) {
				socket.once('connect', () => {
					request.once('upload-complete', timeRequest());
				});
			} else {
				request.once('upload-complete', timeRequest());
			}
		});
	}

	if (delays.response !== undefined) {
		request.once('upload-complete', () => {
			const cancelTimeout = addTimeout(delays.response, timeoutHandler, 'response');
			request.once('response', cancelTimeout);
		});
	}
};

module.exports.TimeoutError = TimeoutError;


/***/ }),

/***/ 25:
/***/ (function(module, exports, __webpack_require__) {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = __webpack_require__(317);

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}


/***/ }),

/***/ 49:
/***/ (function(module, __unusedexports, __webpack_require__) {

var wrappy = __webpack_require__(11)
module.exports = wrappy(once)
module.exports.strict = wrappy(onceStrict)

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return onceStrict(this)
    },
    configurable: true
  })
})

function once (fn) {
  var f = function () {
    if (f.called) return f.value
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  f.called = false
  return f
}

function onceStrict (fn) {
  var f = function () {
    if (f.called)
      throw new Error(f.onceError)
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  var name = fn.name || 'Function wrapped with `once`'
  f.onceError = name + " shouldn't be called more than once"
  f.called = false
  return f
}


/***/ }),

/***/ 53:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

// TODO: Use the `URL` global when targeting Node.js 10
const URLParser = typeof URL === 'undefined' ? __webpack_require__(835).URL : URL;

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
const DATA_URL_DEFAULT_MIME_TYPE = 'text/plain';
const DATA_URL_DEFAULT_CHARSET = 'us-ascii';

const testParameter = (name, filters) => {
	return filters.some(filter => filter instanceof RegExp ? filter.test(name) : filter === name);
};

const normalizeDataURL = (urlString, {stripHash}) => {
	const parts = urlString.match(/^data:(.*?),(.*?)(?:#(.*))?$/);

	if (!parts) {
		throw new Error(`Invalid URL: ${urlString}`);
	}

	const mediaType = parts[1].split(';');
	const body = parts[2];
	const hash = stripHash ? '' : parts[3];

	let base64 = false;

	if (mediaType[mediaType.length - 1] === 'base64') {
		mediaType.pop();
		base64 = true;
	}

	// Lowercase MIME type
	const mimeType = (mediaType.shift() || '').toLowerCase();
	const attributes = mediaType
		.map(attribute => {
			let [key, value = ''] = attribute.split('=').map(string => string.trim());

			// Lowercase `charset`
			if (key === 'charset') {
				value = value.toLowerCase();

				if (value === DATA_URL_DEFAULT_CHARSET) {
					return '';
				}
			}

			return `${key}${value ? `=${value}` : ''}`;
		})
		.filter(Boolean);

	const normalizedMediaType = [
		...attributes
	];

	if (base64) {
		normalizedMediaType.push('base64');
	}

	if (normalizedMediaType.length !== 0 || (mimeType && mimeType !== DATA_URL_DEFAULT_MIME_TYPE)) {
		normalizedMediaType.unshift(mimeType);
	}

	return `data:${normalizedMediaType.join(';')},${base64 ? body.trim() : body}${hash ? `#${hash}` : ''}`;
};

const normalizeUrl = (urlString, options) => {
	options = {
		defaultProtocol: 'http:',
		normalizeProtocol: true,
		forceHttp: false,
		forceHttps: false,
		stripAuthentication: true,
		stripHash: false,
		stripWWW: true,
		removeQueryParameters: [/^utm_\w+/i],
		removeTrailingSlash: true,
		removeDirectoryIndex: false,
		sortQueryParameters: true,
		...options
	};

	// TODO: Remove this at some point in the future
	if (Reflect.has(options, 'normalizeHttps')) {
		throw new Error('options.normalizeHttps is renamed to options.forceHttp');
	}

	if (Reflect.has(options, 'normalizeHttp')) {
		throw new Error('options.normalizeHttp is renamed to options.forceHttps');
	}

	if (Reflect.has(options, 'stripFragment')) {
		throw new Error('options.stripFragment is renamed to options.stripHash');
	}

	urlString = urlString.trim();

	// Data URL
	if (/^data:/i.test(urlString)) {
		return normalizeDataURL(urlString, options);
	}

	const hasRelativeProtocol = urlString.startsWith('//');
	const isRelativeUrl = !hasRelativeProtocol && /^\.*\//.test(urlString);

	// Prepend protocol
	if (!isRelativeUrl) {
		urlString = urlString.replace(/^(?!(?:\w+:)?\/\/)|^\/\//, options.defaultProtocol);
	}

	const urlObj = new URLParser(urlString);

	if (options.forceHttp && options.forceHttps) {
		throw new Error('The `forceHttp` and `forceHttps` options cannot be used together');
	}

	if (options.forceHttp && urlObj.protocol === 'https:') {
		urlObj.protocol = 'http:';
	}

	if (options.forceHttps && urlObj.protocol === 'http:') {
		urlObj.protocol = 'https:';
	}

	// Remove auth
	if (options.stripAuthentication) {
		urlObj.username = '';
		urlObj.password = '';
	}

	// Remove hash
	if (options.stripHash) {
		urlObj.hash = '';
	}

	// Remove duplicate slashes if not preceded by a protocol
	if (urlObj.pathname) {
		// TODO: Use the following instead when targeting Node.js 10
		// `urlObj.pathname = urlObj.pathname.replace(/(?<!https?:)\/{2,}/g, '/');`
		urlObj.pathname = urlObj.pathname.replace(/((?!:).|^)\/{2,}/g, (_, p1) => {
			if (/^(?!\/)/g.test(p1)) {
				return `${p1}/`;
			}

			return '/';
		});
	}

	// Decode URI octets
	if (urlObj.pathname) {
		urlObj.pathname = decodeURI(urlObj.pathname);
	}

	// Remove directory index
	if (options.removeDirectoryIndex === true) {
		options.removeDirectoryIndex = [/^index\.[a-z]+$/];
	}

	if (Array.isArray(options.removeDirectoryIndex) && options.removeDirectoryIndex.length > 0) {
		let pathComponents = urlObj.pathname.split('/');
		const lastComponent = pathComponents[pathComponents.length - 1];

		if (testParameter(lastComponent, options.removeDirectoryIndex)) {
			pathComponents = pathComponents.slice(0, pathComponents.length - 1);
			urlObj.pathname = pathComponents.slice(1).join('/') + '/';
		}
	}

	if (urlObj.hostname) {
		// Remove trailing dot
		urlObj.hostname = urlObj.hostname.replace(/\.$/, '');

		// Remove `www.`
		if (options.stripWWW && /^www\.([a-z\-\d]{2,63})\.([a-z.]{2,5})$/.test(urlObj.hostname)) {
			// Each label should be max 63 at length (min: 2).
			// The extension should be max 5 at length (min: 2).
			// Source: https://en.wikipedia.org/wiki/Hostname#Restrictions_on_valid_host_names
			urlObj.hostname = urlObj.hostname.replace(/^www\./, '');
		}
	}

	// Remove query unwanted parameters
	if (Array.isArray(options.removeQueryParameters)) {
		for (const key of [...urlObj.searchParams.keys()]) {
			if (testParameter(key, options.removeQueryParameters)) {
				urlObj.searchParams.delete(key);
			}
		}
	}

	// Sort query parameters
	if (options.sortQueryParameters) {
		urlObj.searchParams.sort();
	}

	if (options.removeTrailingSlash) {
		urlObj.pathname = urlObj.pathname.replace(/\/$/, '');
	}

	// Take advantage of many of the Node `url` normalizations
	urlString = urlObj.toString();

	// Remove ending `/`
	if ((options.removeTrailingSlash || urlObj.pathname === '/') && urlObj.hash === '') {
		urlString = urlString.replace(/\/$/, '');
	}

	// Restore relative protocol, if applicable
	if (hasRelativeProtocol && !options.normalizeProtocol) {
		urlString = urlString.replace(/^http:\/\//, '//');
	}

	// Remove http/https
	if (options.stripProtocol) {
		urlString = urlString.replace(/^(?:https?:)?\/\//, '');
	}

	return urlString;
};

module.exports = normalizeUrl;
// TODO: Remove this for the next major release
module.exports.default = normalizeUrl;


/***/ }),

/***/ 57:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const fs = __webpack_require__(747);
const util = __webpack_require__(669);
const is = __webpack_require__(534);
const isFormData = __webpack_require__(504);

module.exports = async options => {
	const {body} = options;

	if (options.headers['content-length']) {
		return Number(options.headers['content-length']);
	}

	if (!body && !options.stream) {
		return 0;
	}

	if (is.string(body)) {
		return Buffer.byteLength(body);
	}

	if (isFormData(body)) {
		return util.promisify(body.getLength.bind(body))();
	}

	if (body instanceof fs.ReadStream) {
		const {size} = await util.promisify(fs.stat)(body.path);
		return size;
	}

	return null;
};


/***/ }),

/***/ 72:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const {PassThrough} = __webpack_require__(413);

module.exports = options => {
	options = Object.assign({}, options);

	const {array} = options;
	let {encoding} = options;
	const buffer = encoding === 'buffer';
	let objectMode = false;

	if (array) {
		objectMode = !(encoding || buffer);
	} else {
		encoding = encoding || 'utf8';
	}

	if (buffer) {
		encoding = null;
	}

	let len = 0;
	const ret = [];
	const stream = new PassThrough({objectMode});

	if (encoding) {
		stream.setEncoding(encoding);
	}

	stream.on('data', chunk => {
		ret.push(chunk);

		if (objectMode) {
			len = ret.length;
		} else {
			len += chunk.length;
		}
	});

	stream.getBufferedValue = () => {
		if (array) {
			return ret;
		}

		return buffer ? Buffer.concat(ret, len) : ret.join('');
	};

	stream.getBufferedLength = () => len;

	return stream;
};


/***/ }),

/***/ 81:
/***/ (function(module, exports, __webpack_require__) {

/**
 * Module dependencies.
 */

var tty = __webpack_require__(867);
var util = __webpack_require__(669);

/**
 * This is the Node.js implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(25);
exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(function (key) {
  return /^debug_/i.test(key);
}).reduce(function (obj, key) {
  // camel-case
  var prop = key
    .substring(6)
    .toLowerCase()
    .replace(/_([a-z])/g, function (_, k) { return k.toUpperCase() });

  // coerce string value into JS value
  var val = process.env[key];
  if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
  else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
  else if (val === 'null') val = null;
  else val = Number(val);

  obj[prop] = val;
  return obj;
}, {});

/**
 * The file descriptor to write the `debug()` calls to.
 * Set the `DEBUG_FD` env variable to override with another value. i.e.:
 *
 *   $ DEBUG_FD=3 node script.js 3>debug.log
 */

var fd = parseInt(process.env.DEBUG_FD, 10) || 2;

if (1 !== fd && 2 !== fd) {
  util.deprecate(function(){}, 'except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)')()
}

var stream = 1 === fd ? process.stdout :
             2 === fd ? process.stderr :
             createWritableStdioStream(fd);

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
  return 'colors' in exports.inspectOpts
    ? Boolean(exports.inspectOpts.colors)
    : tty.isatty(fd);
}

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

exports.formatters.o = function(v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts)
    .split('\n').map(function(str) {
      return str.trim()
    }).join(' ');
};

/**
 * Map %o to `util.inspect()`, allowing multiple lines if needed.
 */

exports.formatters.O = function(v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts);
};

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var name = this.namespace;
  var useColors = this.useColors;

  if (useColors) {
    var c = this.color;
    var prefix = '  \u001b[3' + c + ';1m' + name + ' ' + '\u001b[0m';

    args[0] = prefix + args[0].split('\n').join('\n' + prefix);
    args.push('\u001b[3' + c + 'm+' + exports.humanize(this.diff) + '\u001b[0m');
  } else {
    args[0] = new Date().toUTCString()
      + ' ' + name + ' ' + args[0];
  }
}

/**
 * Invokes `util.format()` with the specified arguments and writes to `stream`.
 */

function log() {
  return stream.write(util.format.apply(util, arguments) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  if (null == namespaces) {
    // If you set a process.env field to null or undefined, it gets cast to the
    // string 'null' or 'undefined'. Just delete instead.
    delete process.env.DEBUG;
  } else {
    process.env.DEBUG = namespaces;
  }
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  return process.env.DEBUG;
}

/**
 * Copied from `node/src/node.js`.
 *
 * XXX: It's lame that node doesn't expose this API out-of-the-box. It also
 * relies on the undocumented `tty_wrap.guessHandleType()` which is also lame.
 */

function createWritableStdioStream (fd) {
  var stream;
  var tty_wrap = process.binding('tty_wrap');

  // Note stream._type is used for test-module-load-list.js

  switch (tty_wrap.guessHandleType(fd)) {
    case 'TTY':
      stream = new tty.WriteStream(fd);
      stream._type = 'tty';

      // Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    case 'FILE':
      var fs = __webpack_require__(747);
      stream = new fs.SyncWriteStream(fd, { autoClose: false });
      stream._type = 'fs';
      break;

    case 'PIPE':
    case 'TCP':
      var net = __webpack_require__(631);
      stream = new net.Socket({
        fd: fd,
        readable: false,
        writable: true
      });

      // FIXME Should probably have an option in net.Socket to create a
      // stream from an existing fd which is writable only. But for now
      // we'll just add this hack and set the `readable` member to false.
      // Test: ./node test/fixtures/echo.js < /etc/passwd
      stream.readable = false;
      stream.read = null;
      stream._type = 'pipe';

      // FIXME Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    default:
      // Probably an error on in uv_guess_handle()
      throw new Error('Implement me. Unknown stream file type!');
  }

  // For supporting legacy API we put the FD here.
  stream.fd = fd;

  stream._isStdio = true;

  return stream;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init (debug) {
  debug.inspectOpts = {};

  var keys = Object.keys(exports.inspectOpts);
  for (var i = 0; i < keys.length; i++) {
    debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
  }
}

/**
 * Enable namespaces listed in `process.env.DEBUG` initially.
 */

exports.enable(load());


/***/ }),

/***/ 86:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const {URL, URLSearchParams} = __webpack_require__(835); // TODO: Use the `URL` global when targeting Node.js 10
const urlLib = __webpack_require__(835);
const is = __webpack_require__(534);
const urlParseLax = __webpack_require__(173);
const lowercaseKeys = __webpack_require__(474);
const urlToOptions = __webpack_require__(811);
const isFormData = __webpack_require__(504);
const merge = __webpack_require__(821);
const knownHookEvents = __webpack_require__(433);

const retryAfterStatusCodes = new Set([413, 429, 503]);

// `preNormalize` handles static options (e.g. headers).
// For example, when you create a custom instance and make a request
// with no static changes, they won't be normalized again.
//
// `normalize` operates on dynamic options - they cannot be saved.
// For example, `body` is everytime different per request.
// When it's done normalizing the new options, it performs merge()
// on the prenormalized options and the normalized ones.

const preNormalize = (options, defaults) => {
	if (is.nullOrUndefined(options.headers)) {
		options.headers = {};
	} else {
		options.headers = lowercaseKeys(options.headers);
	}

	if (options.baseUrl && !options.baseUrl.toString().endsWith('/')) {
		options.baseUrl += '/';
	}

	if (options.stream) {
		options.json = false;
	}

	if (is.nullOrUndefined(options.hooks)) {
		options.hooks = {};
	} else if (!is.object(options.hooks)) {
		throw new TypeError(`Parameter \`hooks\` must be an object, not ${is(options.hooks)}`);
	}

	for (const event of knownHookEvents) {
		if (is.nullOrUndefined(options.hooks[event])) {
			if (defaults) {
				options.hooks[event] = [...defaults.hooks[event]];
			} else {
				options.hooks[event] = [];
			}
		}
	}

	if (is.number(options.timeout)) {
		options.gotTimeout = {request: options.timeout};
	} else if (is.object(options.timeout)) {
		options.gotTimeout = options.timeout;
	}

	delete options.timeout;

	const {retry} = options;
	options.retry = {
		retries: 0,
		methods: [],
		statusCodes: [],
		errorCodes: []
	};

	if (is.nonEmptyObject(defaults) && retry !== false) {
		options.retry = {...defaults.retry};
	}

	if (retry !== false) {
		if (is.number(retry)) {
			options.retry.retries = retry;
		} else {
			options.retry = {...options.retry, ...retry};
		}
	}

	if (options.gotTimeout) {
		options.retry.maxRetryAfter = Math.min(...[options.gotTimeout.request, options.gotTimeout.connection].filter(n => !is.nullOrUndefined(n)));
	}

	if (is.array(options.retry.methods)) {
		options.retry.methods = new Set(options.retry.methods.map(method => method.toUpperCase()));
	}

	if (is.array(options.retry.statusCodes)) {
		options.retry.statusCodes = new Set(options.retry.statusCodes);
	}

	if (is.array(options.retry.errorCodes)) {
		options.retry.errorCodes = new Set(options.retry.errorCodes);
	}

	return options;
};

const normalize = (url, options, defaults) => {
	if (is.plainObject(url)) {
		options = {...url, ...options};
		url = options.url || {};
		delete options.url;
	}

	if (defaults) {
		options = merge({}, defaults.options, options ? preNormalize(options, defaults.options) : {});
	} else {
		options = merge({}, preNormalize(options));
	}

	if (!is.string(url) && !is.object(url)) {
		throw new TypeError(`Parameter \`url\` must be a string or object, not ${is(url)}`);
	}

	if (is.string(url)) {
		if (options.baseUrl) {
			if (url.toString().startsWith('/')) {
				url = url.toString().slice(1);
			}

			url = urlToOptions(new URL(url, options.baseUrl));
		} else {
			url = url.replace(/^unix:/, 'http://$&');
			url = urlParseLax(url);
		}
	} else if (is(url) === 'URL') {
		url = urlToOptions(url);
	}

	// Override both null/undefined with default protocol
	options = merge({path: ''}, url, {protocol: url.protocol || 'https:'}, options);

	for (const hook of options.hooks.init) {
		const called = hook(options);

		if (is.promise(called)) {
			throw new TypeError('The `init` hook must be a synchronous function');
		}
	}

	const {baseUrl} = options;
	Object.defineProperty(options, 'baseUrl', {
		set: () => {
			throw new Error('Failed to set baseUrl. Options are normalized already.');
		},
		get: () => baseUrl
	});

	const {query} = options;
	if (is.nonEmptyString(query) || is.nonEmptyObject(query) || query instanceof URLSearchParams) {
		if (!is.string(query)) {
			options.query = (new URLSearchParams(query)).toString();
		}

		options.path = `${options.path.split('?')[0]}?${options.query}`;
		delete options.query;
	}

	if (options.hostname === 'unix') {
		const matches = /(.+?):(.+)/.exec(options.path);

		if (matches) {
			const [, socketPath, path] = matches;
			options = {
				...options,
				socketPath,
				path,
				host: null
			};
		}
	}

	const {headers} = options;
	for (const [key, value] of Object.entries(headers)) {
		if (is.nullOrUndefined(value)) {
			delete headers[key];
		}
	}

	if (options.json && is.undefined(headers.accept)) {
		headers.accept = 'application/json';
	}

	if (options.decompress && is.undefined(headers['accept-encoding'])) {
		headers['accept-encoding'] = 'gzip, deflate';
	}

	const {body} = options;
	if (is.nullOrUndefined(body)) {
		options.method = options.method ? options.method.toUpperCase() : 'GET';
	} else {
		const isObject = is.object(body) && !is.buffer(body) && !is.nodeStream(body);
		if (!is.nodeStream(body) && !is.string(body) && !is.buffer(body) && !(options.form || options.json)) {
			throw new TypeError('The `body` option must be a stream.Readable, string or Buffer');
		}

		if (options.json && !(isObject || is.array(body))) {
			throw new TypeError('The `body` option must be an Object or Array when the `json` option is used');
		}

		if (options.form && !isObject) {
			throw new TypeError('The `body` option must be an Object when the `form` option is used');
		}

		if (isFormData(body)) {
			// Special case for https://github.com/form-data/form-data
			headers['content-type'] = headers['content-type'] || `multipart/form-data; boundary=${body.getBoundary()}`;
		} else if (options.form) {
			headers['content-type'] = headers['content-type'] || 'application/x-www-form-urlencoded';
			options.body = (new URLSearchParams(body)).toString();
		} else if (options.json) {
			headers['content-type'] = headers['content-type'] || 'application/json';
			options.body = JSON.stringify(body);
		}

		options.method = options.method ? options.method.toUpperCase() : 'POST';
	}

	if (!is.function(options.retry.retries)) {
		const {retries} = options.retry;

		options.retry.retries = (iteration, error) => {
			if (iteration > retries) {
				return 0;
			}

			if ((!error || !options.retry.errorCodes.has(error.code)) && (!options.retry.methods.has(error.method) || !options.retry.statusCodes.has(error.statusCode))) {
				return 0;
			}

			if (Reflect.has(error, 'headers') && Reflect.has(error.headers, 'retry-after') && retryAfterStatusCodes.has(error.statusCode)) {
				let after = Number(error.headers['retry-after']);
				if (is.nan(after)) {
					after = Date.parse(error.headers['retry-after']) - Date.now();
				} else {
					after *= 1000;
				}

				if (after > options.retry.maxRetryAfter) {
					return 0;
				}

				return after;
			}

			if (error.statusCode === 413) {
				return 0;
			}

			const noise = Math.random() * 100;
			return ((2 ** (iteration - 1)) * 1000) + noise;
		};
	}

	return options;
};

const reNormalize = options => normalize(urlLib.format(options), options);

module.exports = normalize;
module.exports.preNormalize = preNormalize;
module.exports.reNormalize = reNormalize;


/***/ }),

/***/ 87:
/***/ (function(module) {

module.exports = require("os");

/***/ }),

/***/ 89:
/***/ (function(module) {

"use strict";


// We define these manually to ensure they're always copied
// even if they would move up the prototype chain
// https://nodejs.org/api/http.html#http_class_http_incomingmessage
const knownProps = [
	'destroy',
	'setTimeout',
	'socket',
	'headers',
	'trailers',
	'rawHeaders',
	'statusCode',
	'httpVersion',
	'httpVersionMinor',
	'httpVersionMajor',
	'rawTrailers',
	'statusMessage'
];

module.exports = (fromStream, toStream) => {
	const fromProps = new Set(Object.keys(fromStream).concat(knownProps));

	for (const prop of fromProps) {
		// Don't overwrite existing properties
		if (prop in toStream) {
			continue;
		}

		toStream[prop] = typeof fromStream[prop] === 'function' ? fromStream[prop].bind(fromStream) : fromStream[prop];
	}
};


/***/ }),

/***/ 93:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const Readable = __webpack_require__(413).Readable;
const lowercaseKeys = __webpack_require__(474);

class Response extends Readable {
	constructor(statusCode, headers, body, url) {
		if (typeof statusCode !== 'number') {
			throw new TypeError('Argument `statusCode` should be a number');
		}
		if (typeof headers !== 'object') {
			throw new TypeError('Argument `headers` should be an object');
		}
		if (!(body instanceof Buffer)) {
			throw new TypeError('Argument `body` should be a buffer');
		}
		if (typeof url !== 'string') {
			throw new TypeError('Argument `url` should be a string');
		}

		super();
		this.statusCode = statusCode;
		this.headers = lowercaseKeys(headers);
		this.body = body;
		this.url = url;
	}

	_read() {
		this.push(this.body);
		this.push(null);
	}
}

module.exports = Response;


/***/ }),

/***/ 97:
/***/ (function(module) {

"use strict";

module.exports = object => {
	const result = {};

	for (const [key, value] of Object.entries(object)) {
		result[key.toLowerCase()] = value;
	}

	return result;
};


/***/ }),

/***/ 104:
/***/ (function(__unusedmodule, __unusedexports, __webpack_require__) {

// @ts-check
const core = __webpack_require__(470)
const exec = __webpack_require__(986)
const io = __webpack_require__(1)
const hasha = __webpack_require__(309)
const got = __webpack_require__(798)
const {
  restoreCache,
  saveCache
} = __webpack_require__(717)
const fs = __webpack_require__(747)
const os = __webpack_require__(87)
const path = __webpack_require__(622)
const quote = __webpack_require__(531)
const cliParser = __webpack_require__(880)()

/**
 * A small utility for checking when an URL responds, kind of
 * a poor man's https://www.npmjs.com/package/wait-on
 */
const ping = (url, timeout) => {
  const start = +new Date()
  return got(url, {
    retry: {
      retries(retry, error) {
        const now = +new Date()
        core.debug(
          `${now - start}ms ${error.method} ${error.host} ${
            error.code
          }`
        )
        if (now - start > timeout) {
          console.error('%s timed out', url)
          return 0
        }
        return 1000
      }
    }
  })
}

const isWindows = () => os.platform() === 'win32'

const homeDirectory = os.homedir()
const platformAndArch = `${process.platform}-${process.arch}`

const workingDirectory =
  core.getInput('working-directory') || process.cwd()

/**
 * When running "npm install" or any other Cypress-related commands,
 * use the install directory as current working directory
 */
const cypressCommandOptions = {
  cwd: workingDirectory
}

const yarnFilename = path.join(
  workingDirectory,
  'yarn.lock'
)
const packageLockFilename = path.join(
  workingDirectory,
  'package-lock.json'
)

const useYarn = () => fs.existsSync(yarnFilename)

const lockHash = () => {
  const lockFilename = useYarn()
    ? yarnFilename
    : packageLockFilename
  return hasha.fromFileSync(lockFilename)
}

// enforce the same NPM cache folder across different operating systems
const NPM_CACHE_FOLDER = path.join(homeDirectory, '.npm')
const getNpmCache = () => {
  const o = {}
  let key = core.getInput('cache-key')
  const hash = lockHash()
  if (!key) {
    if (useYarn()) {
      key = `yarn-${platformAndArch}-${hash}`
    } else {
      key = `npm-${platformAndArch}-${hash}`
    }
  } else {
    console.log('using custom cache key "%s"', key)
  }

  if (useYarn()) {
    o.inputPath = path.join(homeDirectory, '.cache', 'yarn')
  } else {
    o.inputPath = NPM_CACHE_FOLDER
  }

  o.restoreKeys = o.primaryKey = key
  return o
}

// custom Cypress binary cache folder
// see https://on.cypress.io/caching
const CYPRESS_CACHE_FOLDER = path.join(
  homeDirectory,
  '.cache',
  'Cypress'
)
core.debug(
  `using custom Cypress cache folder "${CYPRESS_CACHE_FOLDER}"`
)

const getCypressBinaryCache = () => {
  const o = {
    inputPath: CYPRESS_CACHE_FOLDER,
    restoreKeys: `cypress-${platformAndArch}-`
  }
  o.primaryKey = o.restoreKeys + lockHash()
  return o
}

const restoreCachedNpm = () => {
  core.debug('trying to restore cached NPM modules')
  const NPM_CACHE = getNpmCache()
  return restoreCache(
    NPM_CACHE.inputPath,
    NPM_CACHE.primaryKey,
    NPM_CACHE.restoreKeys
  )
}

const saveCachedNpm = () => {
  core.debug('saving NPM modules')
  const NPM_CACHE = getNpmCache()
  return saveCache(
    NPM_CACHE.inputPath,
    NPM_CACHE.primaryKey
  )
}

const restoreCachedCypressBinary = () => {
  core.debug('trying to restore cached Cypress binary')
  const CYPRESS_BINARY_CACHE = getCypressBinaryCache()
  return restoreCache(
    CYPRESS_BINARY_CACHE.inputPath,
    CYPRESS_BINARY_CACHE.primaryKey,
    CYPRESS_BINARY_CACHE.restoreKeys
  )
}

const saveCachedCypressBinary = () => {
  core.debug('saving Cypress binary')
  const CYPRESS_BINARY_CACHE = getCypressBinaryCache()
  return saveCache(
    CYPRESS_BINARY_CACHE.inputPath,
    CYPRESS_BINARY_CACHE.primaryKey
  )
}

const install = () => {
  // prevent lots of progress messages during install
  core.exportVariable('CI', '1')
  core.exportVariable(
    'CYPRESS_CACHE_FOLDER',
    CYPRESS_CACHE_FOLDER
  )
  const customCacheKey = core.getInput('cache-key')

  if (customCacheKey) {
    return
  }
  // Note: need to quote found tool to avoid Windows choking on
  // npm paths with spaces like "C:\Program Files\nodejs\npm.cmd ci"

  if (useYarn()) {
    core.debug('installing NPM dependencies using Yarn')
    return io.which('yarn', true).then(yarnPath => {
      core.debug(`yarn at "${yarnPath}"`)
      return exec.exec(
        quote(yarnPath),
        ['--frozen-lockfile'],
        cypressCommandOptions
      )
    })
  } else {
    core.debug('installing NPM dependencies')
    core.exportVariable(
      'npm_config_cache',
      NPM_CACHE_FOLDER
    )

    return io.which('npm', true).then(npmPath => {
      core.debug(`npm at "${npmPath}"`)
      return exec.exec(
        quote(npmPath),
        ['ci'],
        cypressCommandOptions
      )
    })
  }
}

const verifyCypressBinary = () => {
  core.debug('Verifying Cypress')
  core.exportVariable(
    'CYPRESS_CACHE_FOLDER',
    CYPRESS_CACHE_FOLDER
  )
  return io.which('npx', true).then(npxPath => {
    return exec.exec(
      quote(npxPath),
      ['cypress', 'verify'],
      cypressCommandOptions
    )
  })
}

/**
 * Grabs a boolean GitHub Action parameter input and casts it.
 * @param {string} name - parameter name
 * @param {boolean} defaultValue - default value to use if the parameter was not specified
 * @returns {boolean} converted input argument or default value
 */
const getInputBool = (name, defaultValue = false) => {
  const param = core.getInput(name)
  if (param === 'true' || param === '1') {
    return true
  }
  if (param === 'false' || param === '0') {
    return false
  }

  return defaultValue
}

const buildAppMaybe = () => {
  const buildApp = core.getInput('build')
  if (!buildApp) {
    return
  }

  core.debug(`building application using "${buildApp}"`)

  // TODO: allow specifying custom working folder?
  return exec.exec(buildApp)
}

const startServerMaybe = () => {
  let startCommand

  if (isWindows()) {
    // allow custom Windows start command
    startCommand =
      core.getInput('start-windows') ||
      core.getInput('start')
  } else {
    startCommand = core.getInput('start')
  }
  if (!startCommand) {
    core.debug('No start command found')
    return
  }

  console.log(
    'starting server with command "%s"',
    startCommand
  )
  console.log(
    'current working directory "%s"',
    process.cwd()
  )

  const args = cliParser.parse(startCommand)
  core.debug(`parsed command: ${args.join(' ')}`)

  return io.which(args[0], true).then(toolPath => {
    core.debug(`found command "${toolPath}"`)
    core.debug(`with arguments ${args.slice(1).join(' ')}`)

    const toolArguments = args.slice(1)
    core.debug(
      `running ${quote(toolPath)} ${toolArguments.join(
        ' '
      )}`
    )
    core.debug('without waiting for the promise to resolve')

    // TODO specify working directory when running the server?
    exec.exec(quote(toolPath), toolArguments)
  })
}

const waitOnMaybe = () => {
  const waitOn = core.getInput('wait-on')
  if (!waitOn) {
    return
  }

  const waitOnTimeout =
    core.getInput('wait-on-timeout') || '60'

  console.log(
    'waiting on "%s" with timeout of %s seconds',
    waitOn,
    waitOnTimeout
  )

  const waitTimeoutMs = parseFloat(waitOnTimeout) * 1000

  return ping(waitOn, waitTimeoutMs)
}

const I = x => x

const runTests = () => {
  const runTests = getInputBool('runTests', true)
  if (!runTests) {
    console.log(
      'Skipping running tests: runTests parameter is false'
    )
    return
  }

  core.debug('Running Cypress tests')
  const quoteArgument = isWindows() ? quote : I

  const commandPrefix = core.getInput('command-prefix')
  const record = getInputBool('record')
  const parallel = getInputBool('parallel')
  const headless = getInputBool('headless')

  // TODO using yarn to run cypress when yarn is used for install
  // split potentially long

  return io.which('npx', true).then(npxPath => {
    core.exportVariable(
      'CYPRESS_CACHE_FOLDER',
      CYPRESS_CACHE_FOLDER
    )

    let cmd = []
    if (commandPrefix) {
      // we need to split the command prefix into individual arguments
      // otherwise they are passed all as a single string
      const parts = commandPrefix.split(' ')
      cmd = cmd.concat(parts)
      core.debug(
        `with concatenated command prefix: ${cmd.join(' ')}`
      )
    }
    // push each CLI argument separately
    cmd.push('cypress')
    cmd.push('run')
    if (headless) {
      cmd.push('--headless')
    }
    if (record) {
      cmd.push('--record')
    }
    if (parallel) {
      cmd.push('--parallel')
    }
    const group = core.getInput('group')
    if (group) {
      cmd.push('--group')
      cmd.push(quoteArgument(group))
    }
    const tag = core.getInput('tag')
    if (tag) {
      cmd.push('--tag')
      cmd.push(quoteArgument(tag))
    }
    const configInput = core.getInput('config')
    if (configInput) {
      cmd.push('--config')
      cmd.push(quoteArgument(configInput))
    }
    const spec = core.getInput('spec')
    if (spec) {
      cmd.push('--spec')
      cmd.push(quoteArgument(spec))
    }
    const configFileInput = core.getInput('config-file')
    if (configFileInput) {
      cmd.push('--config-file')
      cmd.push(quoteArgument(configFileInput))
    }
    if (parallel || group) {
      // on GitHub Actions we can use workflow name and SHA commit to tie multiple jobs together
      // until a better workflow id is available
      // https://github.community/t5/GitHub-Actions/Add-build-number/td-p/30548
      // https://github.com/actions/toolkit/issues/65
      const { GITHUB_WORKFLOW, GITHUB_SHA } = process.env
      const parallelId = `${GITHUB_WORKFLOW} - ${GITHUB_SHA}`
      const customCiBuildId =
        core.getInput('ci-build-id') || parallelId
      cmd.push('--ci-build-id')
      cmd.push(quoteArgument(customCiBuildId))
    }

    const browser = core.getInput('browser')
    if (browser) {
      cmd.push('--browser')
      // TODO should browser be quoted?
      // If it is a path, it might have spaces
      cmd.push(browser)
    }

    const envInput = core.getInput('env')
    if (envInput) {
      // TODO should env be quoted?
      // If it is a JSON, it might have spaces
      cmd.push('--env')
      cmd.push(envInput)
    }

    console.log(
      'Cypress test command: npx %s',
      cmd.join(' ')
    )

    core.exportVariable('TERM', 'xterm')
    // since we have quoted arguments ourselves, do not double quote them
    const opts = {
      ...cypressCommandOptions,
      windowsVerbatimArguments: false
    }

    core.debug(
      `in working directory "${cypressCommandOptions.workingDirectory}"`
    )
    return exec.exec(quote(npxPath), cmd, opts)
  })
}

const installMaybe = () => {
  const installParameter = getInputBool('install', true)
  if (!installParameter) {
    console.log(
      'Skipping install because install parameter is false'
    )
    return Promise.resolve()
  }

  return Promise.all([
    restoreCachedNpm(),
    restoreCachedCypressBinary()
  ]).then(([npmCacheHit, cypressCacheHit]) => {
    core.debug(`npm cache hit ${npmCacheHit}`)
    core.debug(`cypress cache hit ${cypressCacheHit}`)

    return install().then(() => {
      if (npmCacheHit && cypressCacheHit) {
        core.debug(
          'no need to verify Cypress binary or save caches'
        )
        return
      }

      return verifyCypressBinary()
        .then(saveCachedNpm)
        .then(saveCachedCypressBinary)
    })
  })
}

installMaybe()
  .then(buildAppMaybe)
  .then(startServerMaybe)
  .then(waitOnMaybe)
  .then(runTests)
  .then(() => {
    core.debug('all done, exiting')
    // force exit to avoid waiting for child processes,
    // like the server we have started
    // see https://github.com/actions/toolkit/issues/216
    process.exit(0)
  })
  .catch(error => {
    console.log(error)
    core.setFailed(error.message)
    process.exit(1)
  })


/***/ }),

/***/ 128:
/***/ (function(module) {

"use strict";

module.exports = (url, opts) => {
	if (typeof url !== 'string') {
		throw new TypeError(`Expected \`url\` to be of type \`string\`, got \`${typeof url}\``);
	}

	url = url.trim();
	opts = Object.assign({https: false}, opts);

	if (/^\.*\/|^(?!localhost)\w+:/.test(url)) {
		return url;
	}

	return url.replace(/^(?!(?:\w+:)?\/\/)/, opts.https ? 'https://' : 'http://');
};


/***/ }),

/***/ 129:
/***/ (function(module) {

module.exports = require("child_process");

/***/ }),

/***/ 145:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const pump = __webpack_require__(453);
const bufferStream = __webpack_require__(966);

class MaxBufferError extends Error {
	constructor() {
		super('maxBuffer exceeded');
		this.name = 'MaxBufferError';
	}
}

async function getStream(inputStream, options) {
	if (!inputStream) {
		return Promise.reject(new Error('Expected a stream'));
	}

	options = {
		maxBuffer: Infinity,
		...options
	};

	const {maxBuffer} = options;

	let stream;
	await new Promise((resolve, reject) => {
		const rejectPromise = error => {
			if (error) { // A null check
				error.bufferedData = stream.getBufferedValue();
			}

			reject(error);
		};

		stream = pump(inputStream, bufferStream(options), error => {
			if (error) {
				rejectPromise(error);
				return;
			}

			resolve();
		});

		stream.on('data', () => {
			if (stream.getBufferedLength() > maxBuffer) {
				rejectPromise(new MaxBufferError());
			}
		});
	});

	return stream.getBufferedValue();
}

module.exports = getStream;
// TODO: Remove this for the next major release
module.exports.default = getStream;
module.exports.buffer = (stream, options) => getStream(stream, {...options, encoding: 'buffer'});
module.exports.array = (stream, options) => getStream(stream, {...options, array: true});
module.exports.MaxBufferError = MaxBufferError;


/***/ }),

/***/ 154:
/***/ (function(module) {

"use strict";

// rfc7231 6.1
const statusCodeCacheableByDefault = [
    200,
    203,
    204,
    206,
    300,
    301,
    404,
    405,
    410,
    414,
    501,
];

// This implementation does not understand partial responses (206)
const understoodStatuses = [
    200,
    203,
    204,
    300,
    301,
    302,
    303,
    307,
    308,
    404,
    405,
    410,
    414,
    501,
];

const hopByHopHeaders = {
    date: true, // included, because we add Age update Date
    connection: true,
    'keep-alive': true,
    'proxy-authenticate': true,
    'proxy-authorization': true,
    te: true,
    trailer: true,
    'transfer-encoding': true,
    upgrade: true,
};
const excludedFromRevalidationUpdate = {
    // Since the old body is reused, it doesn't make sense to change properties of the body
    'content-length': true,
    'content-encoding': true,
    'transfer-encoding': true,
    'content-range': true,
};

function parseCacheControl(header) {
    const cc = {};
    if (!header) return cc;

    // TODO: When there is more than one value present for a given directive (e.g., two Expires header fields, multiple Cache-Control: max-age directives),
    // the directive's value is considered invalid. Caches are encouraged to consider responses that have invalid freshness information to be stale
    const parts = header.trim().split(/\s*,\s*/); // TODO: lame parsing
    for (const part of parts) {
        const [k, v] = part.split(/\s*=\s*/, 2);
        cc[k] = v === undefined ? true : v.replace(/^"|"$/g, ''); // TODO: lame unquoting
    }

    return cc;
}

function formatCacheControl(cc) {
    let parts = [];
    for (const k in cc) {
        const v = cc[k];
        parts.push(v === true ? k : k + '=' + v);
    }
    if (!parts.length) {
        return undefined;
    }
    return parts.join(', ');
}

module.exports = class CachePolicy {
    constructor(
        req,
        res,
        {
            shared,
            cacheHeuristic,
            immutableMinTimeToLive,
            ignoreCargoCult,
            trustServerDate,
            _fromObject,
        } = {}
    ) {
        if (_fromObject) {
            this._fromObject(_fromObject);
            return;
        }

        if (!res || !res.headers) {
            throw Error('Response headers missing');
        }
        this._assertRequestHasHeaders(req);

        this._responseTime = this.now();
        this._isShared = shared !== false;
        this._trustServerDate =
            undefined !== trustServerDate ? trustServerDate : true;
        this._cacheHeuristic =
            undefined !== cacheHeuristic ? cacheHeuristic : 0.1; // 10% matches IE
        this._immutableMinTtl =
            undefined !== immutableMinTimeToLive
                ? immutableMinTimeToLive
                : 24 * 3600 * 1000;

        this._status = 'status' in res ? res.status : 200;
        this._resHeaders = res.headers;
        this._rescc = parseCacheControl(res.headers['cache-control']);
        this._method = 'method' in req ? req.method : 'GET';
        this._url = req.url;
        this._host = req.headers.host;
        this._noAuthorization = !req.headers.authorization;
        this._reqHeaders = res.headers.vary ? req.headers : null; // Don't keep all request headers if they won't be used
        this._reqcc = parseCacheControl(req.headers['cache-control']);

        // Assume that if someone uses legacy, non-standard uncecessary options they don't understand caching,
        // so there's no point stricly adhering to the blindly copy&pasted directives.
        if (
            ignoreCargoCult &&
            'pre-check' in this._rescc &&
            'post-check' in this._rescc
        ) {
            delete this._rescc['pre-check'];
            delete this._rescc['post-check'];
            delete this._rescc['no-cache'];
            delete this._rescc['no-store'];
            delete this._rescc['must-revalidate'];
            this._resHeaders = Object.assign({}, this._resHeaders, {
                'cache-control': formatCacheControl(this._rescc),
            });
            delete this._resHeaders.expires;
            delete this._resHeaders.pragma;
        }

        // When the Cache-Control header field is not present in a request, caches MUST consider the no-cache request pragma-directive
        // as having the same effect as if "Cache-Control: no-cache" were present (see Section 5.2.1).
        if (
            res.headers['cache-control'] == null &&
            /no-cache/.test(res.headers.pragma)
        ) {
            this._rescc['no-cache'] = true;
        }
    }

    now() {
        return Date.now();
    }

    storable() {
        // The "no-store" request directive indicates that a cache MUST NOT store any part of either this request or any response to it.
        return !!(
            !this._reqcc['no-store'] &&
            // A cache MUST NOT store a response to any request, unless:
            // The request method is understood by the cache and defined as being cacheable, and
            ('GET' === this._method ||
                'HEAD' === this._method ||
                ('POST' === this._method && this._hasExplicitExpiration())) &&
            // the response status code is understood by the cache, and
            understoodStatuses.indexOf(this._status) !== -1 &&
            // the "no-store" cache directive does not appear in request or response header fields, and
            !this._rescc['no-store'] &&
            // the "private" response directive does not appear in the response, if the cache is shared, and
            (!this._isShared || !this._rescc.private) &&
            // the Authorization header field does not appear in the request, if the cache is shared,
            (!this._isShared ||
                this._noAuthorization ||
                this._allowsStoringAuthenticated()) &&
            // the response either:
            // contains an Expires header field, or
            (this._resHeaders.expires ||
                // contains a max-age response directive, or
                // contains a s-maxage response directive and the cache is shared, or
                // contains a public response directive.
                this._rescc.public ||
                this._rescc['max-age'] ||
                this._rescc['s-maxage'] ||
                // has a status code that is defined as cacheable by default
                statusCodeCacheableByDefault.indexOf(this._status) !== -1)
        );
    }

    _hasExplicitExpiration() {
        // 4.2.1 Calculating Freshness Lifetime
        return (
            (this._isShared && this._rescc['s-maxage']) ||
            this._rescc['max-age'] ||
            this._resHeaders.expires
        );
    }

    _assertRequestHasHeaders(req) {
        if (!req || !req.headers) {
            throw Error('Request headers missing');
        }
    }

    satisfiesWithoutRevalidation(req) {
        this._assertRequestHasHeaders(req);

        // When presented with a request, a cache MUST NOT reuse a stored response, unless:
        // the presented request does not contain the no-cache pragma (Section 5.4), nor the no-cache cache directive,
        // unless the stored response is successfully validated (Section 4.3), and
        const requestCC = parseCacheControl(req.headers['cache-control']);
        if (requestCC['no-cache'] || /no-cache/.test(req.headers.pragma)) {
            return false;
        }

        if (requestCC['max-age'] && this.age() > requestCC['max-age']) {
            return false;
        }

        if (
            requestCC['min-fresh'] &&
            this.timeToLive() < 1000 * requestCC['min-fresh']
        ) {
            return false;
        }

        // the stored response is either:
        // fresh, or allowed to be served stale
        if (this.stale()) {
            const allowsStale =
                requestCC['max-stale'] &&
                !this._rescc['must-revalidate'] &&
                (true === requestCC['max-stale'] ||
                    requestCC['max-stale'] > this.age() - this.maxAge());
            if (!allowsStale) {
                return false;
            }
        }

        return this._requestMatches(req, false);
    }

    _requestMatches(req, allowHeadMethod) {
        // The presented effective request URI and that of the stored response match, and
        return (
            (!this._url || this._url === req.url) &&
            this._host === req.headers.host &&
            // the request method associated with the stored response allows it to be used for the presented request, and
            (!req.method ||
                this._method === req.method ||
                (allowHeadMethod && 'HEAD' === req.method)) &&
            // selecting header fields nominated by the stored response (if any) match those presented, and
            this._varyMatches(req)
        );
    }

    _allowsStoringAuthenticated() {
        //  following Cache-Control response directives (Section 5.2.2) have such an effect: must-revalidate, public, and s-maxage.
        return (
            this._rescc['must-revalidate'] ||
            this._rescc.public ||
            this._rescc['s-maxage']
        );
    }

    _varyMatches(req) {
        if (!this._resHeaders.vary) {
            return true;
        }

        // A Vary header field-value of "*" always fails to match
        if (this._resHeaders.vary === '*') {
            return false;
        }

        const fields = this._resHeaders.vary
            .trim()
            .toLowerCase()
            .split(/\s*,\s*/);
        for (const name of fields) {
            if (req.headers[name] !== this._reqHeaders[name]) return false;
        }
        return true;
    }

    _copyWithoutHopByHopHeaders(inHeaders) {
        const headers = {};
        for (const name in inHeaders) {
            if (hopByHopHeaders[name]) continue;
            headers[name] = inHeaders[name];
        }
        // 9.1.  Connection
        if (inHeaders.connection) {
            const tokens = inHeaders.connection.trim().split(/\s*,\s*/);
            for (const name of tokens) {
                delete headers[name];
            }
        }
        if (headers.warning) {
            const warnings = headers.warning.split(/,/).filter(warning => {
                return !/^\s*1[0-9][0-9]/.test(warning);
            });
            if (!warnings.length) {
                delete headers.warning;
            } else {
                headers.warning = warnings.join(',').trim();
            }
        }
        return headers;
    }

    responseHeaders() {
        const headers = this._copyWithoutHopByHopHeaders(this._resHeaders);
        const age = this.age();

        // A cache SHOULD generate 113 warning if it heuristically chose a freshness
        // lifetime greater than 24 hours and the response's age is greater than 24 hours.
        if (
            age > 3600 * 24 &&
            !this._hasExplicitExpiration() &&
            this.maxAge() > 3600 * 24
        ) {
            headers.warning =
                (headers.warning ? `${headers.warning}, ` : '') +
                '113 - "rfc7234 5.5.4"';
        }
        headers.age = `${Math.round(age)}`;
        headers.date = new Date(this.now()).toUTCString();
        return headers;
    }

    /**
     * Value of the Date response header or current time if Date was demed invalid
     * @return timestamp
     */
    date() {
        if (this._trustServerDate) {
            return this._serverDate();
        }
        return this._responseTime;
    }

    _serverDate() {
        const dateValue = Date.parse(this._resHeaders.date);
        if (isFinite(dateValue)) {
            const maxClockDrift = 8 * 3600 * 1000;
            const clockDrift = Math.abs(this._responseTime - dateValue);
            if (clockDrift < maxClockDrift) {
                return dateValue;
            }
        }
        return this._responseTime;
    }

    /**
     * Value of the Age header, in seconds, updated for the current time.
     * May be fractional.
     *
     * @return Number
     */
    age() {
        let age = Math.max(0, (this._responseTime - this.date()) / 1000);
        if (this._resHeaders.age) {
            let ageValue = this._ageValue();
            if (ageValue > age) age = ageValue;
        }

        const residentTime = (this.now() - this._responseTime) / 1000;
        return age + residentTime;
    }

    _ageValue() {
        const ageValue = parseInt(this._resHeaders.age);
        return isFinite(ageValue) ? ageValue : 0;
    }

    /**
     * Value of applicable max-age (or heuristic equivalent) in seconds. This counts since response's `Date`.
     *
     * For an up-to-date value, see `timeToLive()`.
     *
     * @return Number
     */
    maxAge() {
        if (!this.storable() || this._rescc['no-cache']) {
            return 0;
        }

        // Shared responses with cookies are cacheable according to the RFC, but IMHO it'd be unwise to do so by default
        // so this implementation requires explicit opt-in via public header
        if (
            this._isShared &&
            (this._resHeaders['set-cookie'] &&
                !this._rescc.public &&
                !this._rescc.immutable)
        ) {
            return 0;
        }

        if (this._resHeaders.vary === '*') {
            return 0;
        }

        if (this._isShared) {
            if (this._rescc['proxy-revalidate']) {
                return 0;
            }
            // if a response includes the s-maxage directive, a shared cache recipient MUST ignore the Expires field.
            if (this._rescc['s-maxage']) {
                return parseInt(this._rescc['s-maxage'], 10);
            }
        }

        // If a response includes a Cache-Control field with the max-age directive, a recipient MUST ignore the Expires field.
        if (this._rescc['max-age']) {
            return parseInt(this._rescc['max-age'], 10);
        }

        const defaultMinTtl = this._rescc.immutable ? this._immutableMinTtl : 0;

        const dateValue = this._serverDate();
        if (this._resHeaders.expires) {
            const expires = Date.parse(this._resHeaders.expires);
            // A cache recipient MUST interpret invalid date formats, especially the value "0", as representing a time in the past (i.e., "already expired").
            if (Number.isNaN(expires) || expires < dateValue) {
                return 0;
            }
            return Math.max(defaultMinTtl, (expires - dateValue) / 1000);
        }

        if (this._resHeaders['last-modified']) {
            const lastModified = Date.parse(this._resHeaders['last-modified']);
            if (isFinite(lastModified) && dateValue > lastModified) {
                return Math.max(
                    defaultMinTtl,
                    ((dateValue - lastModified) / 1000) * this._cacheHeuristic
                );
            }
        }

        return defaultMinTtl;
    }

    timeToLive() {
        return Math.max(0, this.maxAge() - this.age()) * 1000;
    }

    stale() {
        return this.maxAge() <= this.age();
    }

    static fromObject(obj) {
        return new this(undefined, undefined, { _fromObject: obj });
    }

    _fromObject(obj) {
        if (this._responseTime) throw Error('Reinitialized');
        if (!obj || obj.v !== 1) throw Error('Invalid serialization');

        this._responseTime = obj.t;
        this._isShared = obj.sh;
        this._cacheHeuristic = obj.ch;
        this._immutableMinTtl =
            obj.imm !== undefined ? obj.imm : 24 * 3600 * 1000;
        this._status = obj.st;
        this._resHeaders = obj.resh;
        this._rescc = obj.rescc;
        this._method = obj.m;
        this._url = obj.u;
        this._host = obj.h;
        this._noAuthorization = obj.a;
        this._reqHeaders = obj.reqh;
        this._reqcc = obj.reqcc;
    }

    toObject() {
        return {
            v: 1,
            t: this._responseTime,
            sh: this._isShared,
            ch: this._cacheHeuristic,
            imm: this._immutableMinTtl,
            st: this._status,
            resh: this._resHeaders,
            rescc: this._rescc,
            m: this._method,
            u: this._url,
            h: this._host,
            a: this._noAuthorization,
            reqh: this._reqHeaders,
            reqcc: this._reqcc,
        };
    }

    /**
     * Headers for sending to the origin server to revalidate stale response.
     * Allows server to return 304 to allow reuse of the previous response.
     *
     * Hop by hop headers are always stripped.
     * Revalidation headers may be added or removed, depending on request.
     */
    revalidationHeaders(incomingReq) {
        this._assertRequestHasHeaders(incomingReq);
        const headers = this._copyWithoutHopByHopHeaders(incomingReq.headers);

        // This implementation does not understand range requests
        delete headers['if-range'];

        if (!this._requestMatches(incomingReq, true) || !this.storable()) {
            // revalidation allowed via HEAD
            // not for the same resource, or wasn't allowed to be cached anyway
            delete headers['if-none-match'];
            delete headers['if-modified-since'];
            return headers;
        }

        /* MUST send that entity-tag in any cache validation request (using If-Match or If-None-Match) if an entity-tag has been provided by the origin server. */
        if (this._resHeaders.etag) {
            headers['if-none-match'] = headers['if-none-match']
                ? `${headers['if-none-match']}, ${this._resHeaders.etag}`
                : this._resHeaders.etag;
        }

        // Clients MAY issue simple (non-subrange) GET requests with either weak validators or strong validators. Clients MUST NOT use weak validators in other forms of request.
        const forbidsWeakValidators =
            headers['accept-ranges'] ||
            headers['if-match'] ||
            headers['if-unmodified-since'] ||
            (this._method && this._method != 'GET');

        /* SHOULD send the Last-Modified value in non-subrange cache validation requests (using If-Modified-Since) if only a Last-Modified value has been provided by the origin server.
        Note: This implementation does not understand partial responses (206) */
        if (forbidsWeakValidators) {
            delete headers['if-modified-since'];

            if (headers['if-none-match']) {
                const etags = headers['if-none-match']
                    .split(/,/)
                    .filter(etag => {
                        return !/^\s*W\//.test(etag);
                    });
                if (!etags.length) {
                    delete headers['if-none-match'];
                } else {
                    headers['if-none-match'] = etags.join(',').trim();
                }
            }
        } else if (
            this._resHeaders['last-modified'] &&
            !headers['if-modified-since']
        ) {
            headers['if-modified-since'] = this._resHeaders['last-modified'];
        }

        return headers;
    }

    /**
     * Creates new CachePolicy with information combined from the previews response,
     * and the new revalidation response.
     *
     * Returns {policy, modified} where modified is a boolean indicating
     * whether the response body has been modified, and old cached body can't be used.
     *
     * @return {Object} {policy: CachePolicy, modified: Boolean}
     */
    revalidatedPolicy(request, response) {
        this._assertRequestHasHeaders(request);
        if (!response || !response.headers) {
            throw Error('Response headers missing');
        }

        // These aren't going to be supported exactly, since one CachePolicy object
        // doesn't know about all the other cached objects.
        let matches = false;
        if (response.status !== undefined && response.status != 304) {
            matches = false;
        } else if (
            response.headers.etag &&
            !/^\s*W\//.test(response.headers.etag)
        ) {
            // "All of the stored responses with the same strong validator are selected.
            // If none of the stored responses contain the same strong validator,
            // then the cache MUST NOT use the new response to update any stored responses."
            matches =
                this._resHeaders.etag &&
                this._resHeaders.etag.replace(/^\s*W\//, '') ===
                    response.headers.etag;
        } else if (this._resHeaders.etag && response.headers.etag) {
            // "If the new response contains a weak validator and that validator corresponds
            // to one of the cache's stored responses,
            // then the most recent of those matching stored responses is selected for update."
            matches =
                this._resHeaders.etag.replace(/^\s*W\//, '') ===
                response.headers.etag.replace(/^\s*W\//, '');
        } else if (this._resHeaders['last-modified']) {
            matches =
                this._resHeaders['last-modified'] ===
                response.headers['last-modified'];
        } else {
            // If the new response does not include any form of validator (such as in the case where
            // a client generates an If-Modified-Since request from a source other than the Last-Modified
            // response header field), and there is only one stored response, and that stored response also
            // lacks a validator, then that stored response is selected for update.
            if (
                !this._resHeaders.etag &&
                !this._resHeaders['last-modified'] &&
                !response.headers.etag &&
                !response.headers['last-modified']
            ) {
                matches = true;
            }
        }

        if (!matches) {
            return {
                policy: new this.constructor(request, response),
                // Client receiving 304 without body, even if it's invalid/mismatched has no option
                // but to reuse a cached body. We don't have a good way to tell clients to do
                // error recovery in such case.
                modified: response.status != 304,
                matches: false,
            };
        }

        // use other header fields provided in the 304 (Not Modified) response to replace all instances
        // of the corresponding header fields in the stored response.
        const headers = {};
        for (const k in this._resHeaders) {
            headers[k] =
                k in response.headers && !excludedFromRevalidationUpdate[k]
                    ? response.headers[k]
                    : this._resHeaders[k];
        }

        const newResponse = Object.assign({}, response, {
            status: this._status,
            method: this._method,
            headers,
        });
        return {
            policy: new this.constructor(request, newResponse, {
                shared: this._isShared,
                cacheHeuristic: this._cacheHeuristic,
                immutableMinTimeToLive: this._immutableMinTtl,
                trustServerDate: this._trustServerDate,
            }),
            modified: false,
            matches: true,
        };
    }
};


/***/ }),

/***/ 173:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const url = __webpack_require__(835);
const prependHttp = __webpack_require__(128);

module.exports = (input, options) => {
	if (typeof input !== 'string') {
		throw new TypeError(`Expected \`url\` to be of type \`string\`, got \`${typeof input}\` instead.`);
	}

	const finalUrl = prependHttp(input, Object.assign({https: true}, options));
	return url.parse(finalUrl);
};


/***/ }),

/***/ 205:
/***/ (function(__unusedmodule, exports) {

//TODO: handle reviver/dehydrate function like normal
//and handle indentation, like normal.
//if anyone needs this... please send pull request.

exports.stringify = function stringify (o) {
  if('undefined' == typeof o) return o

  if(o && Buffer.isBuffer(o))
    return JSON.stringify(':base64:' + o.toString('base64'))

  if(o && o.toJSON)
    o =  o.toJSON()

  if(o && 'object' === typeof o) {
    var s = ''
    var array = Array.isArray(o)
    s = array ? '[' : '{'
    var first = true

    for(var k in o) {
      var ignore = 'function' == typeof o[k] || (!array && 'undefined' === typeof o[k])
      if(Object.hasOwnProperty.call(o, k) && !ignore) {
        if(!first)
          s += ','
        first = false
        if (array) {
          if(o[k] == undefined)
            s += 'null'
          else
            s += stringify(o[k])
        } else if (o[k] !== void(0)) {
          s += stringify(k) + ':' + stringify(o[k])
        }
      }
    }

    s += array ? ']' : '}'

    return s
  } else if ('string' === typeof o) {
    return JSON.stringify(/^:/.test(o) ? ':' + o : o)
  } else if ('undefined' === typeof o) {
    return 'null';
  } else
    return JSON.stringify(o)
}

exports.parse = function (s) {
  return JSON.parse(s, function (key, value) {
    if('string' === typeof value) {
      if(/^:base64:/.test(value))
        return new Buffer(value.substring(8), 'base64')
      else
        return /^:/.test(value) ? value.substring(1) : value 
    }
    return value
  })
}


/***/ }),

/***/ 211:
/***/ (function(module) {

module.exports = require("https");

/***/ }),

/***/ 262:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const is = __webpack_require__(534);

module.exports = function deepFreeze(object) {
	for (const [key, value] of Object.entries(object)) {
		if (is.plainObject(value) || is.array(value)) {
			deepFreeze(object[key]);
		}
	}

	return Object.freeze(object);
};


/***/ }),

/***/ 303:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const EventEmitter = __webpack_require__(614);
const JSONB = __webpack_require__(205);

const loadStore = opts => {
	const adapters = {
		redis: '@keyv/redis',
		mongodb: '@keyv/mongo',
		mongo: '@keyv/mongo',
		sqlite: '@keyv/sqlite',
		postgresql: '@keyv/postgres',
		postgres: '@keyv/postgres',
		mysql: '@keyv/mysql'
	};
	if (opts.adapter || opts.uri) {
		const adapter = opts.adapter || /^[^:]*/.exec(opts.uri)[0];
		return new (require(adapters[adapter]))(opts);
	}
	return new Map();
};

class Keyv extends EventEmitter {
	constructor(uri, opts) {
		super();
		this.opts = Object.assign(
			{
				namespace: 'keyv',
				serialize: JSONB.stringify,
				deserialize: JSONB.parse
			},
			(typeof uri === 'string') ? { uri } : uri,
			opts
		);

		if (!this.opts.store) {
			const adapterOpts = Object.assign({}, this.opts);
			this.opts.store = loadStore(adapterOpts);
		}

		if (typeof this.opts.store.on === 'function') {
			this.opts.store.on('error', err => this.emit('error', err));
		}

		this.opts.store.namespace = this.opts.namespace;
	}

	_getKeyPrefix(key) {
		return `${this.opts.namespace}:${key}`;
	}

	get(key) {
		key = this._getKeyPrefix(key);
		const store = this.opts.store;
		return Promise.resolve()
			.then(() => store.get(key))
			.then(data => {
				data = (typeof data === 'string') ? this.opts.deserialize(data) : data;
				if (data === undefined) {
					return undefined;
				}
				if (typeof data.expires === 'number' && Date.now() > data.expires) {
					this.delete(key);
					return undefined;
				}
				return data.value;
			});
	}

	set(key, value, ttl) {
		key = this._getKeyPrefix(key);
		if (typeof ttl === 'undefined') {
			ttl = this.opts.ttl;
		}
		if (ttl === 0) {
			ttl = undefined;
		}
		const store = this.opts.store;

		return Promise.resolve()
			.then(() => {
				const expires = (typeof ttl === 'number') ? (Date.now() + ttl) : null;
				value = { value, expires };
				return store.set(key, this.opts.serialize(value), ttl);
			})
			.then(() => true);
	}

	delete(key) {
		key = this._getKeyPrefix(key);
		const store = this.opts.store;
		return Promise.resolve()
			.then(() => store.delete(key));
	}

	clear() {
		const store = this.opts.store;
		return Promise.resolve()
			.then(() => store.clear());
	}
}

module.exports = Keyv;


/***/ }),

/***/ 309:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const fs = __webpack_require__(747);
const path = __webpack_require__(622);
const crypto = __webpack_require__(417);
const isStream = __webpack_require__(323);

const requireOptional = (name, defaultValue) => {
	try {
		return require(name);
	} catch (_) {
		return defaultValue;
	}
};

const {Worker} = requireOptional('worker_threads', {});

let worker; // Lazy
let taskIdCounter = 0;
const tasks = new Map();

const recreateWorkerError = sourceError => {
	const error = new Error(sourceError.message);

	for (const [key, value] of Object.entries(sourceError)) {
		if (key !== 'message') {
			error[key] = value;
		}
	}

	return error;
};

const createWorker = () => {
	worker = new Worker(__webpack_require__.ab + "thread.js");

	worker.on('message', message => {
		const task = tasks.get(message.id);
		tasks.delete(message.id);

		if (tasks.size === 0) {
			worker.unref();
		}

		if (message.error === undefined) {
			task.resolve(message.value);
		} else {
			task.reject(recreateWorkerError(message.error));
		}
	});

	worker.on('error', error => {
		// Any error here is effectively an equivalent of segfault, and have no scope, so we just throw it on callback level
		throw error;
	});
};

const taskWorker = (method, args, transferList) => new Promise((resolve, reject) => {
	const id = taskIdCounter++;
	tasks.set(id, {resolve, reject});

	if (worker === undefined) {
		createWorker();
	}

	worker.ref();
	worker.postMessage({id, method, args}, transferList);
});

const hasha = (input, options = {}) => {
	let outputEncoding = options.encoding || 'hex';

	if (outputEncoding === 'buffer') {
		outputEncoding = undefined;
	}

	const hash = crypto.createHash(options.algorithm || 'sha512');

	const update = buffer => {
		const inputEncoding = typeof buffer === 'string' ? 'utf8' : undefined;
		hash.update(buffer, inputEncoding);
	};

	if (Array.isArray(input)) {
		input.forEach(update);
	} else {
		update(input);
	}

	return hash.digest(outputEncoding);
};

hasha.stream = (options = {}) => {
	let outputEncoding = options.encoding || 'hex';

	if (outputEncoding === 'buffer') {
		outputEncoding = undefined;
	}

	const stream = crypto.createHash(options.algorithm || 'sha512');
	stream.setEncoding(outputEncoding);
	return stream;
};

hasha.fromStream = async (stream, options = {}) => {
	if (!isStream(stream)) {
		throw new TypeError('Expected a stream');
	}

	return new Promise((resolve, reject) => {
		// TODO: Use `stream.pipeline` and `stream.finished` when targeting Node.js 10
		stream
			.on('error', reject)
			.pipe(hasha.stream(options))
			.on('error', reject)
			.on('finish', function () {
				resolve(this.read());
			});
	});
};

if (Worker === undefined) {
	hasha.fromFile = async (filePath, options) => hasha.fromStream(fs.createReadStream(filePath), options);
	hasha.async = async (input, options) => hasha(input, options);
} else {
	hasha.fromFile = async (filePath, {algorithm = 'sha512', encoding = 'hex'} = {}) => {
		const hash = await taskWorker('hashFile', [algorithm, filePath]);

		if (encoding === 'buffer') {
			return Buffer.from(hash);
		}

		return Buffer.from(hash).toString(encoding);
	};

	hasha.async = async (input, {algorithm = 'sha512', encoding = 'hex'} = {}) => {
		if (encoding === 'buffer') {
			encoding = undefined;
		}

		const hash = await taskWorker('hash', [algorithm, input]);

		if (encoding === undefined) {
			return Buffer.from(hash);
		}

		return Buffer.from(hash).toString(encoding);
	};
}

hasha.fromFileSync = (filePath, options) => hasha(fs.readFileSync(filePath), options);

module.exports = hasha;


/***/ }),

/***/ 317:
/***/ (function(module) {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}


/***/ }),

/***/ 323:
/***/ (function(module) {

"use strict";


const isStream = stream =>
	stream !== null &&
	typeof stream === 'object' &&
	typeof stream.pipe === 'function';

isStream.writable = stream =>
	isStream(stream) &&
	stream.writable !== false &&
	typeof stream._write === 'function' &&
	typeof stream._writableState === 'object';

isStream.readable = stream =>
	isStream(stream) &&
	stream.readable !== false &&
	typeof stream._read === 'function' &&
	typeof stream._readableState === 'object';

isStream.duplex = stream =>
	isStream.writable(stream) &&
	isStream.readable(stream);

isStream.transform = stream =>
	isStream.duplex(stream) &&
	typeof stream._transform === 'function' &&
	typeof stream._transformState === 'object';

module.exports = isStream;


/***/ }),

/***/ 325:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const PassThrough = __webpack_require__(413).PassThrough;
const mimicResponse = __webpack_require__(89);

const cloneResponse = response => {
	if (!(response && response.pipe)) {
		throw new TypeError('Parameter `response` must be a response stream.');
	}

	const clone = new PassThrough();
	mimicResponse(response, clone);

	return response.pipe(clone);
};

module.exports = cloneResponse;


/***/ }),

/***/ 338:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const errors = __webpack_require__(774);
const asStream = __webpack_require__(794);
const asPromise = __webpack_require__(916);
const normalizeArguments = __webpack_require__(86);
const merge = __webpack_require__(821);
const deepFreeze = __webpack_require__(262);

const getPromiseOrStream = options => options.stream ? asStream(options) : asPromise(options);

const aliases = [
	'get',
	'post',
	'put',
	'patch',
	'head',
	'delete'
];

const create = defaults => {
	defaults = merge({}, defaults);
	normalizeArguments.preNormalize(defaults.options);

	if (!defaults.handler) {
		// This can't be getPromiseOrStream, because when merging
		// the chain would stop at this point and no further handlers would be called.
		defaults.handler = (options, next) => next(options);
	}

	function got(url, options) {
		try {
			return defaults.handler(normalizeArguments(url, options, defaults), getPromiseOrStream);
		} catch (error) {
			if (options && options.stream) {
				throw error;
			} else {
				return Promise.reject(error);
			}
		}
	}

	got.create = create;
	got.extend = options => {
		let mutableDefaults;
		if (options && Reflect.has(options, 'mutableDefaults')) {
			mutableDefaults = options.mutableDefaults;
			delete options.mutableDefaults;
		} else {
			mutableDefaults = defaults.mutableDefaults;
		}

		return create({
			options: merge.options(defaults.options, options),
			handler: defaults.handler,
			mutableDefaults
		});
	};

	got.mergeInstances = (...args) => create(merge.instances(args));

	got.stream = (url, options) => got(url, {...options, stream: true});

	for (const method of aliases) {
		got[method] = (url, options) => got(url, {...options, method});
		got.stream[method] = (url, options) => got.stream(url, {...options, method});
	}

	Object.assign(got, {...errors, mergeOptions: merge.options});
	Object.defineProperty(got, 'defaults', {
		value: defaults.mutableDefaults ? defaults : deepFreeze(defaults),
		writable: defaults.mutableDefaults,
		configurable: defaults.mutableDefaults,
		enumerable: true
	});

	return got;
};

module.exports = create;


/***/ }),

/***/ 357:
/***/ (function(module) {

module.exports = require("assert");

/***/ }),

/***/ 365:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const {Transform} = __webpack_require__(413);

module.exports = {
	download(response, emitter, downloadBodySize) {
		let downloaded = 0;

		return new Transform({
			transform(chunk, encoding, callback) {
				downloaded += chunk.length;

				const percent = downloadBodySize ? downloaded / downloadBodySize : 0;

				// Let `flush()` be responsible for emitting the last event
				if (percent < 1) {
					emitter.emit('downloadProgress', {
						percent,
						transferred: downloaded,
						total: downloadBodySize
					});
				}

				callback(null, chunk);
			},

			flush(callback) {
				emitter.emit('downloadProgress', {
					percent: 1,
					transferred: downloaded,
					total: downloadBodySize
				});

				callback();
			}
		});
	},

	upload(request, emitter, uploadBodySize) {
		const uploadEventFrequency = 150;
		let uploaded = 0;
		let progressInterval;

		emitter.emit('uploadProgress', {
			percent: 0,
			transferred: 0,
			total: uploadBodySize
		});

		request.once('error', () => {
			clearInterval(progressInterval);
		});

		request.once('response', () => {
			clearInterval(progressInterval);

			emitter.emit('uploadProgress', {
				percent: 1,
				transferred: uploaded,
				total: uploadBodySize
			});
		});

		request.once('socket', socket => {
			const onSocketConnect = () => {
				progressInterval = setInterval(() => {
					const lastUploaded = uploaded;
					/* istanbul ignore next: see #490 (occurs randomly!) */
					const headersSize = request._header ? Buffer.byteLength(request._header) : 0;
					uploaded = socket.bytesWritten - headersSize;

					// Don't emit events with unchanged progress and
					// prevent last event from being emitted, because
					// it's emitted when `response` is emitted
					if (uploaded === lastUploaded || uploaded === uploadBodySize) {
						return;
					}

					emitter.emit('uploadProgress', {
						percent: uploadBodySize ? uploaded / uploadBodySize : 0,
						transferred: uploaded,
						total: uploadBodySize
					});
				}, uploadEventFrequency);
			};

			/* istanbul ignore next: hard to test */
			if (socket.connecting) {
				socket.once('connect', onSocketConnect);
			} else if (socket.writable) {
				// The socket is being reused from pool,
				// so the connect event will not be emitted
				onSocketConnect();
			}
		});
	}
};


/***/ }),

/***/ 408:
/***/ (function(module, exports, __webpack_require__) {

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(25);
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}


/***/ }),

/***/ 413:
/***/ (function(module) {

module.exports = require("stream");

/***/ }),

/***/ 417:
/***/ (function(module) {

module.exports = require("crypto");

/***/ }),

/***/ 431:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const os = __webpack_require__(87);
/**
 * Commands
 *
 * Command Format:
 *   ##[name key=value;key=value]message
 *
 * Examples:
 *   ##[warning]This is the user warning message
 *   ##[set-secret name=mypassword]definitelyNotAPassword!
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        // safely append the val - avoid blowing up when attempting to
                        // call .replace() if message is not a string for some reason
                        cmdStr += `${key}=${escape(`${val || ''}`)},`;
                    }
                }
            }
        }
        cmdStr += CMD_STRING;
        // safely append the message - avoid blowing up when attempting to
        // call .replace() if message is not a string for some reason
        const message = `${this.message || ''}`;
        cmdStr += escapeData(message);
        return cmdStr;
    }
}
function escapeData(s) {
    return s.replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}
function escape(s) {
    return s
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/]/g, '%5D')
        .replace(/;/g, '%3B');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 433:
/***/ (function(module) {

"use strict";


module.exports = [
	'beforeError',
	'init',
	'beforeRequest',
	'beforeRedirect',
	'beforeRetry',
	'afterResponse'
];


/***/ }),

/***/ 453:
/***/ (function(module, __unusedexports, __webpack_require__) {

var once = __webpack_require__(49)
var eos = __webpack_require__(562)
var fs = __webpack_require__(747) // we only need fs to get the ReadStream and WriteStream prototypes

var noop = function () {}
var ancient = /^v?\.0/.test(process.version)

var isFn = function (fn) {
  return typeof fn === 'function'
}

var isFS = function (stream) {
  if (!ancient) return false // newer node version do not need to care about fs is a special way
  if (!fs) return false // browser
  return (stream instanceof (fs.ReadStream || noop) || stream instanceof (fs.WriteStream || noop)) && isFn(stream.close)
}

var isRequest = function (stream) {
  return stream.setHeader && isFn(stream.abort)
}

var destroyer = function (stream, reading, writing, callback) {
  callback = once(callback)

  var closed = false
  stream.on('close', function () {
    closed = true
  })

  eos(stream, {readable: reading, writable: writing}, function (err) {
    if (err) return callback(err)
    closed = true
    callback()
  })

  var destroyed = false
  return function (err) {
    if (closed) return
    if (destroyed) return
    destroyed = true

    if (isFS(stream)) return stream.close(noop) // use close for fs streams to avoid fd leaks
    if (isRequest(stream)) return stream.abort() // request.destroy just do .end - .abort is what we want

    if (isFn(stream.destroy)) return stream.destroy()

    callback(err || new Error('stream was destroyed'))
  }
}

var call = function (fn) {
  fn()
}

var pipe = function (from, to) {
  return from.pipe(to)
}

var pump = function () {
  var streams = Array.prototype.slice.call(arguments)
  var callback = isFn(streams[streams.length - 1] || noop) && streams.pop() || noop

  if (Array.isArray(streams[0])) streams = streams[0]
  if (streams.length < 2) throw new Error('pump requires two streams per minimum')

  var error
  var destroys = streams.map(function (stream, i) {
    var reading = i < streams.length - 1
    var writing = i > 0
    return destroyer(stream, reading, writing, function (err) {
      if (!error) error = err
      if (err) destroys.forEach(call)
      if (reading) return
      destroys.forEach(call)
      callback(error)
    })
  })

  return streams.reduce(pipe)
}

module.exports = pump


/***/ }),

/***/ 456:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const deferToConnect = __webpack_require__(958);

module.exports = request => {
	const timings = {
		start: Date.now(),
		socket: null,
		lookup: null,
		connect: null,
		upload: null,
		response: null,
		end: null,
		error: null,
		phases: {
			wait: null,
			dns: null,
			tcp: null,
			request: null,
			firstByte: null,
			download: null,
			total: null
		}
	};

	const handleError = origin => {
		const emit = origin.emit.bind(origin);
		origin.emit = (event, ...args) => {
			// Catches the `error` event
			if (event === 'error') {
				timings.error = Date.now();
				timings.phases.total = timings.error - timings.start;

				origin.emit = emit;
			}

			// Saves the original behavior
			return emit(event, ...args);
		};
	};

	let uploadFinished = false;
	const onUpload = () => {
		timings.upload = Date.now();
		timings.phases.request = timings.upload - timings.connect;
	};

	handleError(request);

	request.once('socket', socket => {
		timings.socket = Date.now();
		timings.phases.wait = timings.socket - timings.start;

		const lookupListener = () => {
			timings.lookup = Date.now();
			timings.phases.dns = timings.lookup - timings.socket;
		};

		socket.once('lookup', lookupListener);

		deferToConnect(socket, () => {
			timings.connect = Date.now();

			if (timings.lookup === null) {
				socket.removeListener('lookup', lookupListener);
				timings.lookup = timings.connect;
				timings.phases.dns = timings.lookup - timings.socket;
			}

			timings.phases.tcp = timings.connect - timings.lookup;

			if (uploadFinished && !timings.upload) {
				onUpload();
			}
		});
	});

	request.once('finish', () => {
		uploadFinished = true;

		if (timings.connect) {
			onUpload();
		}
	});

	request.once('response', response => {
		timings.response = Date.now();
		timings.phases.firstByte = timings.response - timings.upload;

		handleError(response);

		response.once('end', () => {
			timings.end = Date.now();
			timings.phases.download = timings.end - timings.response;
			timings.phases.total = timings.end - timings.start;
		});
	});

	return timings;
};


/***/ }),

/***/ 470:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = __webpack_require__(431);
const os = __webpack_require__(87);
const path = __webpack_require__(622);
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable
 */
function exportVariable(name, val) {
    process.env[name] = val;
    command_1.issueCommand('set-env', { name }, val);
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    command_1.issueCommand('add-path', {}, inputPath);
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store
 */
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message
 */
function error(message) {
    command_1.issue('error', message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message
 */
function warning(message) {
    command_1.issue('warning', message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store
 */
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 474:
/***/ (function(module) {

"use strict";

module.exports = function (obj) {
	var ret = {};
	var keys = Object.keys(Object(obj));

	for (var i = 0; i < keys.length; i++) {
		ret[keys[i].toLowerCase()] = obj[keys[i]];
	}

	return ret;
};


/***/ }),

/***/ 482:
/***/ (function(module) {

module.exports = {"_args":[["got@9.6.0","/Users/kevinold/cypress-repos/kevinold-github-action"]],"_from":"got@9.6.0","_id":"got@9.6.0","_inBundle":false,"_integrity":"sha512-R7eWptXuGYxwijs0eV+v3o6+XH1IqVK8dJOEecQfTmkncw9AV4dcw/Dhxi8MdlqPthxxpZyizMzyg8RTmEsG+Q==","_location":"/got","_phantomChildren":{"pump":"3.0.0"},"_requested":{"type":"version","registry":true,"raw":"got@9.6.0","name":"got","escapedName":"got","rawSpec":"9.6.0","saveSpec":null,"fetchSpec":"9.6.0"},"_requiredBy":["/"],"_resolved":"https://registry.npmjs.org/got/-/got-9.6.0.tgz","_spec":"9.6.0","_where":"/Users/kevinold/cypress-repos/kevinold-github-action","ava":{"concurrency":4},"browser":{"decompress-response":false,"electron":false},"bugs":{"url":"https://github.com/sindresorhus/got/issues"},"dependencies":{"@sindresorhus/is":"^0.14.0","@szmarczak/http-timer":"^1.1.2","cacheable-request":"^6.0.0","decompress-response":"^3.3.0","duplexer3":"^0.1.4","get-stream":"^4.1.0","lowercase-keys":"^1.0.1","mimic-response":"^1.0.1","p-cancelable":"^1.0.0","to-readable-stream":"^1.0.0","url-parse-lax":"^3.0.0"},"description":"Simplified HTTP requests","devDependencies":{"ava":"^1.1.0","coveralls":"^3.0.0","delay":"^4.1.0","form-data":"^2.3.3","get-port":"^4.0.0","np":"^3.1.0","nyc":"^13.1.0","p-event":"^2.1.0","pem":"^1.13.2","proxyquire":"^2.0.1","sinon":"^7.2.2","slow-stream":"0.0.4","tempfile":"^2.0.0","tempy":"^0.2.1","tough-cookie":"^3.0.0","xo":"^0.24.0"},"engines":{"node":">=8.6"},"files":["source"],"homepage":"https://github.com/sindresorhus/got#readme","keywords":["http","https","get","got","url","uri","request","util","utility","simple","curl","wget","fetch","net","network","electron"],"license":"MIT","main":"source","name":"got","repository":{"type":"git","url":"git+https://github.com/sindresorhus/got.git"},"scripts":{"release":"np","test":"xo && nyc ava"},"version":"9.6.0"};

/***/ }),

/***/ 504:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const is = __webpack_require__(534);

module.exports = body => is.nodeStream(body) && is.function(body.getBoundary);


/***/ }),

/***/ 531:
/***/ (function(module) {

!function(e){if(true)module.exports=e();else { var f; }}(function(){var define,module,exports;module={exports:(exports={})};
function emptyQuotes(options) {
  return options.quotes + options.quotes;
}

function quoteString(options, str) {
  if (str === '') {
    return emptyQuotes(options);
  }
  if (str[0] !== options.quotes) {
    str = options.quotes + str;
  }
  if (str[str.length - 1] !== options.quotes) {
    str += options.quotes;
  }
  return str;
}

function quoteOptions(options, str) {
  if (arguments.length === 1) {
    str = options;
    options = { quotes: '"' };
  }

  if (typeof str === 'string') {
    return quoteString(options, str);
  }

  if (typeof str === 'undefined' || str === null) {
    return emptyQuotes(options);
  }

  return str;
}

function quote(str) {
  if (typeof str === 'object') {
    return quoteOptions.bind(null, str);
  }
  return quoteOptions(str);
}

module.exports = quote;

return module.exports;});

/***/ }),

/***/ 534:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/// <reference lib="es2016"/>
/// <reference lib="es2017.sharedmemory"/>
/// <reference lib="esnext.asynciterable"/>
/// <reference lib="dom"/>
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: Use the `URL` global when targeting Node.js 10
// tslint:disable-next-line
const URLGlobal = typeof URL === 'undefined' ? __webpack_require__(835).URL : URL;
const toString = Object.prototype.toString;
const isOfType = (type) => (value) => typeof value === type;
const isBuffer = (input) => !is.nullOrUndefined(input) && !is.nullOrUndefined(input.constructor) && is.function_(input.constructor.isBuffer) && input.constructor.isBuffer(input);
const getObjectType = (value) => {
    const objectName = toString.call(value).slice(8, -1);
    if (objectName) {
        return objectName;
    }
    return null;
};
const isObjectOfType = (type) => (value) => getObjectType(value) === type;
function is(value) {
    switch (value) {
        case null:
            return "null" /* null */;
        case true:
        case false:
            return "boolean" /* boolean */;
        default:
    }
    switch (typeof value) {
        case 'undefined':
            return "undefined" /* undefined */;
        case 'string':
            return "string" /* string */;
        case 'number':
            return "number" /* number */;
        case 'symbol':
            return "symbol" /* symbol */;
        default:
    }
    if (is.function_(value)) {
        return "Function" /* Function */;
    }
    if (is.observable(value)) {
        return "Observable" /* Observable */;
    }
    if (Array.isArray(value)) {
        return "Array" /* Array */;
    }
    if (isBuffer(value)) {
        return "Buffer" /* Buffer */;
    }
    const tagType = getObjectType(value);
    if (tagType) {
        return tagType;
    }
    if (value instanceof String || value instanceof Boolean || value instanceof Number) {
        throw new TypeError('Please don\'t use object wrappers for primitive types');
    }
    return "Object" /* Object */;
}
(function (is) {
    // tslint:disable-next-line:strict-type-predicates
    const isObject = (value) => typeof value === 'object';
    // tslint:disable:variable-name
    is.undefined = isOfType('undefined');
    is.string = isOfType('string');
    is.number = isOfType('number');
    is.function_ = isOfType('function');
    // tslint:disable-next-line:strict-type-predicates
    is.null_ = (value) => value === null;
    is.class_ = (value) => is.function_(value) && value.toString().startsWith('class ');
    is.boolean = (value) => value === true || value === false;
    is.symbol = isOfType('symbol');
    // tslint:enable:variable-name
    is.numericString = (value) => is.string(value) && value.length > 0 && !Number.isNaN(Number(value));
    is.array = Array.isArray;
    is.buffer = isBuffer;
    is.nullOrUndefined = (value) => is.null_(value) || is.undefined(value);
    is.object = (value) => !is.nullOrUndefined(value) && (is.function_(value) || isObject(value));
    is.iterable = (value) => !is.nullOrUndefined(value) && is.function_(value[Symbol.iterator]);
    is.asyncIterable = (value) => !is.nullOrUndefined(value) && is.function_(value[Symbol.asyncIterator]);
    is.generator = (value) => is.iterable(value) && is.function_(value.next) && is.function_(value.throw);
    is.nativePromise = (value) => isObjectOfType("Promise" /* Promise */)(value);
    const hasPromiseAPI = (value) => !is.null_(value) &&
        isObject(value) &&
        is.function_(value.then) &&
        is.function_(value.catch);
    is.promise = (value) => is.nativePromise(value) || hasPromiseAPI(value);
    is.generatorFunction = isObjectOfType("GeneratorFunction" /* GeneratorFunction */);
    is.asyncFunction = isObjectOfType("AsyncFunction" /* AsyncFunction */);
    is.boundFunction = (value) => is.function_(value) && !value.hasOwnProperty('prototype');
    is.regExp = isObjectOfType("RegExp" /* RegExp */);
    is.date = isObjectOfType("Date" /* Date */);
    is.error = isObjectOfType("Error" /* Error */);
    is.map = (value) => isObjectOfType("Map" /* Map */)(value);
    is.set = (value) => isObjectOfType("Set" /* Set */)(value);
    is.weakMap = (value) => isObjectOfType("WeakMap" /* WeakMap */)(value);
    is.weakSet = (value) => isObjectOfType("WeakSet" /* WeakSet */)(value);
    is.int8Array = isObjectOfType("Int8Array" /* Int8Array */);
    is.uint8Array = isObjectOfType("Uint8Array" /* Uint8Array */);
    is.uint8ClampedArray = isObjectOfType("Uint8ClampedArray" /* Uint8ClampedArray */);
    is.int16Array = isObjectOfType("Int16Array" /* Int16Array */);
    is.uint16Array = isObjectOfType("Uint16Array" /* Uint16Array */);
    is.int32Array = isObjectOfType("Int32Array" /* Int32Array */);
    is.uint32Array = isObjectOfType("Uint32Array" /* Uint32Array */);
    is.float32Array = isObjectOfType("Float32Array" /* Float32Array */);
    is.float64Array = isObjectOfType("Float64Array" /* Float64Array */);
    is.arrayBuffer = isObjectOfType("ArrayBuffer" /* ArrayBuffer */);
    is.sharedArrayBuffer = isObjectOfType("SharedArrayBuffer" /* SharedArrayBuffer */);
    is.dataView = isObjectOfType("DataView" /* DataView */);
    is.directInstanceOf = (instance, klass) => Object.getPrototypeOf(instance) === klass.prototype;
    is.urlInstance = (value) => isObjectOfType("URL" /* URL */)(value);
    is.urlString = (value) => {
        if (!is.string(value)) {
            return false;
        }
        try {
            new URLGlobal(value); // tslint:disable-line no-unused-expression
            return true;
        }
        catch (_a) {
            return false;
        }
    };
    is.truthy = (value) => Boolean(value);
    is.falsy = (value) => !value;
    is.nan = (value) => Number.isNaN(value);
    const primitiveTypes = new Set([
        'undefined',
        'string',
        'number',
        'boolean',
        'symbol'
    ]);
    is.primitive = (value) => is.null_(value) || primitiveTypes.has(typeof value);
    is.integer = (value) => Number.isInteger(value);
    is.safeInteger = (value) => Number.isSafeInteger(value);
    is.plainObject = (value) => {
        // From: https://github.com/sindresorhus/is-plain-obj/blob/master/index.js
        let prototype;
        return getObjectType(value) === "Object" /* Object */ &&
            (prototype = Object.getPrototypeOf(value), prototype === null || // tslint:disable-line:ban-comma-operator
                prototype === Object.getPrototypeOf({}));
    };
    const typedArrayTypes = new Set([
        "Int8Array" /* Int8Array */,
        "Uint8Array" /* Uint8Array */,
        "Uint8ClampedArray" /* Uint8ClampedArray */,
        "Int16Array" /* Int16Array */,
        "Uint16Array" /* Uint16Array */,
        "Int32Array" /* Int32Array */,
        "Uint32Array" /* Uint32Array */,
        "Float32Array" /* Float32Array */,
        "Float64Array" /* Float64Array */
    ]);
    is.typedArray = (value) => {
        const objectType = getObjectType(value);
        if (objectType === null) {
            return false;
        }
        return typedArrayTypes.has(objectType);
    };
    const isValidLength = (value) => is.safeInteger(value) && value > -1;
    is.arrayLike = (value) => !is.nullOrUndefined(value) && !is.function_(value) && isValidLength(value.length);
    is.inRange = (value, range) => {
        if (is.number(range)) {
            return value >= Math.min(0, range) && value <= Math.max(range, 0);
        }
        if (is.array(range) && range.length === 2) {
            return value >= Math.min(...range) && value <= Math.max(...range);
        }
        throw new TypeError(`Invalid range: ${JSON.stringify(range)}`);
    };
    const NODE_TYPE_ELEMENT = 1;
    const DOM_PROPERTIES_TO_CHECK = [
        'innerHTML',
        'ownerDocument',
        'style',
        'attributes',
        'nodeValue'
    ];
    is.domElement = (value) => is.object(value) && value.nodeType === NODE_TYPE_ELEMENT && is.string(value.nodeName) &&
        !is.plainObject(value) && DOM_PROPERTIES_TO_CHECK.every(property => property in value);
    is.observable = (value) => {
        if (!value) {
            return false;
        }
        if (value[Symbol.observable] && value === value[Symbol.observable]()) {
            return true;
        }
        if (value['@@observable'] && value === value['@@observable']()) {
            return true;
        }
        return false;
    };
    is.nodeStream = (value) => !is.nullOrUndefined(value) && isObject(value) && is.function_(value.pipe) && !is.observable(value);
    is.infinite = (value) => value === Infinity || value === -Infinity;
    const isAbsoluteMod2 = (rem) => (value) => is.integer(value) && Math.abs(value % 2) === rem;
    is.even = isAbsoluteMod2(0);
    is.odd = isAbsoluteMod2(1);
    const isWhiteSpaceString = (value) => is.string(value) && /\S/.test(value) === false;
    is.emptyArray = (value) => is.array(value) && value.length === 0;
    is.nonEmptyArray = (value) => is.array(value) && value.length > 0;
    is.emptyString = (value) => is.string(value) && value.length === 0;
    is.nonEmptyString = (value) => is.string(value) && value.length > 0;
    is.emptyStringOrWhitespace = (value) => is.emptyString(value) || isWhiteSpaceString(value);
    is.emptyObject = (value) => is.object(value) && !is.map(value) && !is.set(value) && Object.keys(value).length === 0;
    is.nonEmptyObject = (value) => is.object(value) && !is.map(value) && !is.set(value) && Object.keys(value).length > 0;
    is.emptySet = (value) => is.set(value) && value.size === 0;
    is.nonEmptySet = (value) => is.set(value) && value.size > 0;
    is.emptyMap = (value) => is.map(value) && value.size === 0;
    is.nonEmptyMap = (value) => is.map(value) && value.size > 0;
    const predicateOnArray = (method, predicate, values) => {
        if (is.function_(predicate) === false) {
            throw new TypeError(`Invalid predicate: ${JSON.stringify(predicate)}`);
        }
        if (values.length === 0) {
            throw new TypeError('Invalid number of values');
        }
        return method.call(values, predicate);
    };
    // tslint:disable variable-name
    is.any = (predicate, ...values) => predicateOnArray(Array.prototype.some, predicate, values);
    is.all = (predicate, ...values) => predicateOnArray(Array.prototype.every, predicate, values);
    // tslint:enable variable-name
})(is || (is = {}));
// Some few keywords are reserved, but we'll populate them for Node.js users
// See https://github.com/Microsoft/TypeScript/issues/2536
Object.defineProperties(is, {
    class: {
        value: is.class_
    },
    function: {
        value: is.function_
    },
    null: {
        value: is.null_
    }
});
exports.default = is;
// For CommonJS default export support
module.exports = is;
module.exports.default = is;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 557:
/***/ (function(module) {

"use strict";


class CancelError extends Error {
	constructor(reason) {
		super(reason || 'Promise was canceled');
		this.name = 'CancelError';
	}

	get isCanceled() {
		return true;
	}
}

class PCancelable {
	static fn(userFn) {
		return (...args) => {
			return new PCancelable((resolve, reject, onCancel) => {
				args.push(onCancel);
				userFn(...args).then(resolve, reject);
			});
		};
	}

	constructor(executor) {
		this._cancelHandlers = [];
		this._isPending = true;
		this._isCanceled = false;
		this._rejectOnCancel = true;

		this._promise = new Promise((resolve, reject) => {
			this._reject = reject;

			const onResolve = value => {
				this._isPending = false;
				resolve(value);
			};

			const onReject = error => {
				this._isPending = false;
				reject(error);
			};

			const onCancel = handler => {
				this._cancelHandlers.push(handler);
			};

			Object.defineProperties(onCancel, {
				shouldReject: {
					get: () => this._rejectOnCancel,
					set: bool => {
						this._rejectOnCancel = bool;
					}
				}
			});

			return executor(onResolve, onReject, onCancel);
		});
	}

	then(onFulfilled, onRejected) {
		return this._promise.then(onFulfilled, onRejected);
	}

	catch(onRejected) {
		return this._promise.catch(onRejected);
	}

	finally(onFinally) {
		return this._promise.finally(onFinally);
	}

	cancel(reason) {
		if (!this._isPending || this._isCanceled) {
			return;
		}

		if (this._cancelHandlers.length > 0) {
			try {
				for (const handler of this._cancelHandlers) {
					handler();
				}
			} catch (error) {
				this._reject(error);
			}
		}

		this._isCanceled = true;
		if (this._rejectOnCancel) {
			this._reject(new CancelError(reason));
		}
	}

	get isCanceled() {
		return this._isCanceled;
	}
}

Object.setPrototypeOf(PCancelable.prototype, Promise.prototype);

module.exports = PCancelable;
module.exports.default = PCancelable;

module.exports.CancelError = CancelError;


/***/ }),

/***/ 562:
/***/ (function(module, __unusedexports, __webpack_require__) {

var once = __webpack_require__(49);

var noop = function() {};

var isRequest = function(stream) {
	return stream.setHeader && typeof stream.abort === 'function';
};

var isChildProcess = function(stream) {
	return stream.stdio && Array.isArray(stream.stdio) && stream.stdio.length === 3
};

var eos = function(stream, opts, callback) {
	if (typeof opts === 'function') return eos(stream, null, opts);
	if (!opts) opts = {};

	callback = once(callback || noop);

	var ws = stream._writableState;
	var rs = stream._readableState;
	var readable = opts.readable || (opts.readable !== false && stream.readable);
	var writable = opts.writable || (opts.writable !== false && stream.writable);
	var cancelled = false;

	var onlegacyfinish = function() {
		if (!stream.writable) onfinish();
	};

	var onfinish = function() {
		writable = false;
		if (!readable) callback.call(stream);
	};

	var onend = function() {
		readable = false;
		if (!writable) callback.call(stream);
	};

	var onexit = function(exitCode) {
		callback.call(stream, exitCode ? new Error('exited with error code: ' + exitCode) : null);
	};

	var onerror = function(err) {
		callback.call(stream, err);
	};

	var onclose = function() {
		process.nextTick(onclosenexttick);
	};

	var onclosenexttick = function() {
		if (cancelled) return;
		if (readable && !(rs && (rs.ended && !rs.destroyed))) return callback.call(stream, new Error('premature close'));
		if (writable && !(ws && (ws.ended && !ws.destroyed))) return callback.call(stream, new Error('premature close'));
	};

	var onrequest = function() {
		stream.req.on('finish', onfinish);
	};

	if (isRequest(stream)) {
		stream.on('complete', onfinish);
		stream.on('abort', onclose);
		if (stream.req) onrequest();
		else stream.on('request', onrequest);
	} else if (writable && !ws) { // legacy streams
		stream.on('end', onlegacyfinish);
		stream.on('close', onlegacyfinish);
	}

	if (isChildProcess(stream)) stream.on('exit', onexit);

	stream.on('end', onend);
	stream.on('finish', onfinish);
	if (opts.error !== false) stream.on('error', onerror);
	stream.on('close', onclose);

	return function() {
		cancelled = true;
		stream.removeListener('complete', onfinish);
		stream.removeListener('abort', onclose);
		stream.removeListener('request', onrequest);
		if (stream.req) stream.req.removeListener('finish', onfinish);
		stream.removeListener('end', onlegacyfinish);
		stream.removeListener('close', onlegacyfinish);
		stream.removeListener('finish', onfinish);
		stream.removeListener('exit', onexit);
		stream.removeListener('end', onend);
		stream.removeListener('error', onerror);
		stream.removeListener('close', onclose);
	};
};

module.exports = eos;


/***/ }),

/***/ 584:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const {URL} = __webpack_require__(835); // TODO: Use the `URL` global when targeting Node.js 10
const util = __webpack_require__(669);
const EventEmitter = __webpack_require__(614);
const http = __webpack_require__(605);
const https = __webpack_require__(211);
const urlLib = __webpack_require__(835);
const CacheableRequest = __webpack_require__(946);
const toReadableStream = __webpack_require__(952);
const is = __webpack_require__(534);
const timer = __webpack_require__(456);
const timedOut = __webpack_require__(18);
const getBodySize = __webpack_require__(57);
const getResponse = __webpack_require__(633);
const progress = __webpack_require__(365);
const {CacheError, UnsupportedProtocolError, MaxRedirectsError, RequestError, TimeoutError} = __webpack_require__(774);
const urlToOptions = __webpack_require__(811);

const getMethodRedirectCodes = new Set([300, 301, 302, 303, 304, 305, 307, 308]);
const allMethodRedirectCodes = new Set([300, 303, 307, 308]);

module.exports = (options, input) => {
	const emitter = new EventEmitter();
	const redirects = [];
	let currentRequest;
	let requestUrl;
	let redirectString;
	let uploadBodySize;
	let retryCount = 0;
	let shouldAbort = false;

	const setCookie = options.cookieJar ? util.promisify(options.cookieJar.setCookie.bind(options.cookieJar)) : null;
	const getCookieString = options.cookieJar ? util.promisify(options.cookieJar.getCookieString.bind(options.cookieJar)) : null;
	const agents = is.object(options.agent) ? options.agent : null;

	const emitError = async error => {
		try {
			for (const hook of options.hooks.beforeError) {
				// eslint-disable-next-line no-await-in-loop
				error = await hook(error);
			}

			emitter.emit('error', error);
		} catch (error2) {
			emitter.emit('error', error2);
		}
	};

	const get = async options => {
		const currentUrl = redirectString || requestUrl;

		if (options.protocol !== 'http:' && options.protocol !== 'https:') {
			throw new UnsupportedProtocolError(options);
		}

		decodeURI(currentUrl);

		let fn;
		if (is.function(options.request)) {
			fn = {request: options.request};
		} else {
			fn = options.protocol === 'https:' ? https : http;
		}

		if (agents) {
			const protocolName = options.protocol === 'https:' ? 'https' : 'http';
			options.agent = agents[protocolName] || options.agent;
		}

		/* istanbul ignore next: electron.net is broken */
		if (options.useElectronNet && process.versions.electron) {
			const r = ({x: require})['yx'.slice(1)]; // Trick webpack
			const electron = r('electron');
			fn = electron.net || electron.remote.net;
		}

		if (options.cookieJar) {
			const cookieString = await getCookieString(currentUrl, {});

			if (is.nonEmptyString(cookieString)) {
				options.headers.cookie = cookieString;
			}
		}

		let timings;
		const handleResponse = async response => {
			try {
				/* istanbul ignore next: fixes https://github.com/electron/electron/blob/cbb460d47628a7a146adf4419ed48550a98b2923/lib/browser/api/net.js#L59-L65 */
				if (options.useElectronNet) {
					response = new Proxy(response, {
						get: (target, name) => {
							if (name === 'trailers' || name === 'rawTrailers') {
								return [];
							}

							const value = target[name];
							return is.function(value) ? value.bind(target) : value;
						}
					});
				}

				const {statusCode} = response;
				response.url = currentUrl;
				response.requestUrl = requestUrl;
				response.retryCount = retryCount;
				response.timings = timings;
				response.redirectUrls = redirects;
				response.request = {
					gotOptions: options
				};

				const rawCookies = response.headers['set-cookie'];
				if (options.cookieJar && rawCookies) {
					await Promise.all(rawCookies.map(rawCookie => setCookie(rawCookie, response.url)));
				}

				if (options.followRedirect && 'location' in response.headers) {
					if (allMethodRedirectCodes.has(statusCode) || (getMethodRedirectCodes.has(statusCode) && (options.method === 'GET' || options.method === 'HEAD'))) {
						response.resume(); // We're being redirected, we don't care about the response.

						if (statusCode === 303) {
							// Server responded with "see other", indicating that the resource exists at another location,
							// and the client should request it from that location via GET or HEAD.
							options.method = 'GET';
						}

						if (redirects.length >= 10) {
							throw new MaxRedirectsError(statusCode, redirects, options);
						}

						// Handles invalid URLs. See https://github.com/sindresorhus/got/issues/604
						const redirectBuffer = Buffer.from(response.headers.location, 'binary').toString();
						const redirectURL = new URL(redirectBuffer, currentUrl);
						redirectString = redirectURL.toString();

						redirects.push(redirectString);

						const redirectOptions = {
							...options,
							...urlToOptions(redirectURL)
						};

						for (const hook of options.hooks.beforeRedirect) {
							// eslint-disable-next-line no-await-in-loop
							await hook(redirectOptions);
						}

						emitter.emit('redirect', response, redirectOptions);

						await get(redirectOptions);
						return;
					}
				}

				getResponse(response, options, emitter);
			} catch (error) {
				emitError(error);
			}
		};

		const handleRequest = request => {
			if (shouldAbort) {
				request.once('error', () => {});
				request.abort();
				return;
			}

			currentRequest = request;

			request.once('error', error => {
				if (request.aborted) {
					return;
				}

				if (error instanceof timedOut.TimeoutError) {
					error = new TimeoutError(error, options);
				} else {
					error = new RequestError(error, options);
				}

				if (emitter.retry(error) === false) {
					emitError(error);
				}
			});

			timings = timer(request);

			progress.upload(request, emitter, uploadBodySize);

			if (options.gotTimeout) {
				timedOut(request, options.gotTimeout, options);
			}

			emitter.emit('request', request);

			const uploadComplete = () => {
				request.emit('upload-complete');
			};

			try {
				if (is.nodeStream(options.body)) {
					options.body.once('end', uploadComplete);
					options.body.pipe(request);
					options.body = undefined;
				} else if (options.body) {
					request.end(options.body, uploadComplete);
				} else if (input && (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')) {
					input.once('end', uploadComplete);
					input.pipe(request);
				} else {
					request.end(uploadComplete);
				}
			} catch (error) {
				emitError(new RequestError(error, options));
			}
		};

		if (options.cache) {
			const cacheableRequest = new CacheableRequest(fn.request, options.cache);
			const cacheRequest = cacheableRequest(options, handleResponse);

			cacheRequest.once('error', error => {
				if (error instanceof CacheableRequest.RequestError) {
					emitError(new RequestError(error, options));
				} else {
					emitError(new CacheError(error, options));
				}
			});

			cacheRequest.once('request', handleRequest);
		} else {
			// Catches errors thrown by calling fn.request(...)
			try {
				handleRequest(fn.request(options, handleResponse));
			} catch (error) {
				emitError(new RequestError(error, options));
			}
		}
	};

	emitter.retry = error => {
		let backoff;

		try {
			backoff = options.retry.retries(++retryCount, error);
		} catch (error2) {
			emitError(error2);
			return;
		}

		if (backoff) {
			const retry = async options => {
				try {
					for (const hook of options.hooks.beforeRetry) {
						// eslint-disable-next-line no-await-in-loop
						await hook(options, error, retryCount);
					}

					await get(options);
				} catch (error) {
					emitError(error);
				}
			};

			setTimeout(retry, backoff, {...options, forceRefresh: true});
			return true;
		}

		return false;
	};

	emitter.abort = () => {
		if (currentRequest) {
			currentRequest.once('error', () => {});
			currentRequest.abort();
		} else {
			shouldAbort = true;
		}
	};

	setImmediate(async () => {
		try {
			// Convert buffer to stream to receive upload progress events (#322)
			const {body} = options;
			if (is.buffer(body)) {
				options.body = toReadableStream(body);
				uploadBodySize = body.length;
			} else {
				uploadBodySize = await getBodySize(options);
			}

			if (is.undefined(options.headers['content-length']) && is.undefined(options.headers['transfer-encoding'])) {
				if ((uploadBodySize > 0 || options.method === 'PUT') && !is.null(uploadBodySize)) {
					options.headers['content-length'] = uploadBodySize;
				}
			}

			for (const hook of options.hooks.beforeRequest) {
				// eslint-disable-next-line no-await-in-loop
				await hook(options);
			}

			requestUrl = options.href || (new URL(options.path, urlLib.format(options))).toString();

			await get(options);
		} catch (error) {
			emitError(error);
		}
	});

	return emitter;
};


/***/ }),

/***/ 605:
/***/ (function(module) {

module.exports = require("http");

/***/ }),

/***/ 614:
/***/ (function(module) {

module.exports = require("events");

/***/ }),

/***/ 622:
/***/ (function(module) {

module.exports = require("path");

/***/ }),

/***/ 631:
/***/ (function(module) {

module.exports = require("net");

/***/ }),

/***/ 633:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const decompressResponse = __webpack_require__(861);
const is = __webpack_require__(534);
const mimicResponse = __webpack_require__(89);
const progress = __webpack_require__(365);

module.exports = (response, options, emitter) => {
	const downloadBodySize = Number(response.headers['content-length']) || null;

	const progressStream = progress.download(response, emitter, downloadBodySize);

	mimicResponse(response, progressStream);

	const newResponse = options.decompress === true &&
		is.function(decompressResponse) &&
		options.method !== 'HEAD' ? decompressResponse(progressStream) : progressStream;

	if (!options.decompress && ['gzip', 'deflate'].includes(response.headers['content-encoding'])) {
		options.encoding = null;
	}

	emitter.emit('response', newResponse);

	emitter.emit('downloadProgress', {
		percent: 0,
		transferred: 0,
		total: downloadBodySize
	});

	response.pipe(progressStream);
};


/***/ }),

/***/ 669:
/***/ (function(module) {

module.exports = require("util");

/***/ }),

/***/ 672:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __webpack_require__(357);
const fs = __webpack_require__(747);
const path = __webpack_require__(622);
_a = fs.promises, exports.chmod = _a.chmod, exports.copyFile = _a.copyFile, exports.lstat = _a.lstat, exports.mkdir = _a.mkdir, exports.readdir = _a.readdir, exports.readlink = _a.readlink, exports.rename = _a.rename, exports.rmdir = _a.rmdir, exports.stat = _a.stat, exports.symlink = _a.symlink, exports.unlink = _a.unlink;
exports.IS_WINDOWS = process.platform === 'win32';
function exists(fsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.stat(fsPath);
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                return false;
            }
            throw err;
        }
        return true;
    });
}
exports.exists = exists;
function isDirectory(fsPath, useStat = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const stats = useStat ? yield exports.stat(fsPath) : yield exports.lstat(fsPath);
        return stats.isDirectory();
    });
}
exports.isDirectory = isDirectory;
/**
 * On OSX/Linux, true if path starts with '/'. On Windows, true for paths like:
 * \, \hello, \\hello\share, C:, and C:\hello (and corresponding alternate separator cases).
 */
function isRooted(p) {
    p = normalizeSeparators(p);
    if (!p) {
        throw new Error('isRooted() parameter "p" cannot be empty');
    }
    if (exports.IS_WINDOWS) {
        return (p.startsWith('\\') || /^[A-Z]:/i.test(p) // e.g. \ or \hello or \\hello
        ); // e.g. C: or C:\hello
    }
    return p.startsWith('/');
}
exports.isRooted = isRooted;
/**
 * Recursively create a directory at `fsPath`.
 *
 * This implementation is optimistic, meaning it attempts to create the full
 * path first, and backs up the path stack from there.
 *
 * @param fsPath The path to create
 * @param maxDepth The maximum recursion depth
 * @param depth The current recursion depth
 */
function mkdirP(fsPath, maxDepth = 1000, depth = 1) {
    return __awaiter(this, void 0, void 0, function* () {
        assert_1.ok(fsPath, 'a path argument must be provided');
        fsPath = path.resolve(fsPath);
        if (depth >= maxDepth)
            return exports.mkdir(fsPath);
        try {
            yield exports.mkdir(fsPath);
            return;
        }
        catch (err) {
            switch (err.code) {
                case 'ENOENT': {
                    yield mkdirP(path.dirname(fsPath), maxDepth, depth + 1);
                    yield exports.mkdir(fsPath);
                    return;
                }
                default: {
                    let stats;
                    try {
                        stats = yield exports.stat(fsPath);
                    }
                    catch (err2) {
                        throw err;
                    }
                    if (!stats.isDirectory())
                        throw err;
                }
            }
        }
    });
}
exports.mkdirP = mkdirP;
/**
 * Best effort attempt to determine whether a file exists and is executable.
 * @param filePath    file path to check
 * @param extensions  additional file extensions to try
 * @return if file exists and is executable, returns the file path. otherwise empty string.
 */
function tryGetExecutablePath(filePath, extensions) {
    return __awaiter(this, void 0, void 0, function* () {
        let stats = undefined;
        try {
            // test file exists
            stats = yield exports.stat(filePath);
        }
        catch (err) {
            if (err.code !== 'ENOENT') {
                // eslint-disable-next-line no-console
                console.log(`Unexpected error attempting to determine if executable file exists '${filePath}': ${err}`);
            }
        }
        if (stats && stats.isFile()) {
            if (exports.IS_WINDOWS) {
                // on Windows, test for valid extension
                const upperExt = path.extname(filePath).toUpperCase();
                if (extensions.some(validExt => validExt.toUpperCase() === upperExt)) {
                    return filePath;
                }
            }
            else {
                if (isUnixExecutable(stats)) {
                    return filePath;
                }
            }
        }
        // try each extension
        const originalFilePath = filePath;
        for (const extension of extensions) {
            filePath = originalFilePath + extension;
            stats = undefined;
            try {
                stats = yield exports.stat(filePath);
            }
            catch (err) {
                if (err.code !== 'ENOENT') {
                    // eslint-disable-next-line no-console
                    console.log(`Unexpected error attempting to determine if executable file exists '${filePath}': ${err}`);
                }
            }
            if (stats && stats.isFile()) {
                if (exports.IS_WINDOWS) {
                    // preserve the case of the actual file (since an extension was appended)
                    try {
                        const directory = path.dirname(filePath);
                        const upperName = path.basename(filePath).toUpperCase();
                        for (const actualName of yield exports.readdir(directory)) {
                            if (upperName === actualName.toUpperCase()) {
                                filePath = path.join(directory, actualName);
                                break;
                            }
                        }
                    }
                    catch (err) {
                        // eslint-disable-next-line no-console
                        console.log(`Unexpected error attempting to determine the actual case of the file '${filePath}': ${err}`);
                    }
                    return filePath;
                }
                else {
                    if (isUnixExecutable(stats)) {
                        return filePath;
                    }
                }
            }
        }
        return '';
    });
}
exports.tryGetExecutablePath = tryGetExecutablePath;
function normalizeSeparators(p) {
    p = p || '';
    if (exports.IS_WINDOWS) {
        // convert slashes on Windows
        p = p.replace(/\//g, '\\');
        // remove redundant slashes
        return p.replace(/\\\\+/g, '\\');
    }
    // remove redundant slashes
    return p.replace(/\/\/+/g, '/');
}
// on Mac/Linux, test the execute bit
//     R   W  X  R  W X R W X
//   256 128 64 32 16 8 4 2 1
function isUnixExecutable(stats) {
    return ((stats.mode & 1) > 0 ||
        ((stats.mode & 8) > 0 && stats.gid === process.getgid()) ||
        ((stats.mode & 64) > 0 && stats.uid === process.getuid()));
}
//# sourceMappingURL=io-util.js.map

/***/ }),

/***/ 705:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const pump = __webpack_require__(453);
const bufferStream = __webpack_require__(72);

class MaxBufferError extends Error {
	constructor() {
		super('maxBuffer exceeded');
		this.name = 'MaxBufferError';
	}
}

function getStream(inputStream, options) {
	if (!inputStream) {
		return Promise.reject(new Error('Expected a stream'));
	}

	options = Object.assign({maxBuffer: Infinity}, options);

	const {maxBuffer} = options;

	let stream;
	return new Promise((resolve, reject) => {
		const rejectPromise = error => {
			if (error) { // A null check
				error.bufferedData = stream.getBufferedValue();
			}
			reject(error);
		};

		stream = pump(inputStream, bufferStream(options), error => {
			if (error) {
				rejectPromise(error);
				return;
			}

			resolve();
		});

		stream.on('data', () => {
			if (stream.getBufferedLength() > maxBuffer) {
				rejectPromise(new MaxBufferError());
			}
		});
	}).then(() => stream.getBufferedValue());
}

module.exports = getStream;
module.exports.buffer = (stream, options) => getStream(stream, Object.assign({}, options, {encoding: 'buffer'}));
module.exports.array = (stream, options) => getStream(stream, Object.assign({}, options, {array: true}));
module.exports.MaxBufferError = MaxBufferError;


/***/ }),

/***/ 717:
/***/ (function() {

eval("require")("cache/lib/index");


/***/ }),

/***/ 718:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var stream = __webpack_require__(413);

function DuplexWrapper(options, writable, readable) {
  if (typeof readable === "undefined") {
    readable = writable;
    writable = options;
    options = null;
  }

  stream.Duplex.call(this, options);

  if (typeof readable.read !== "function") {
    readable = (new stream.Readable(options)).wrap(readable);
  }

  this._writable = writable;
  this._readable = readable;
  this._waiting = false;

  var self = this;

  writable.once("finish", function() {
    self.end();
  });

  this.once("finish", function() {
    writable.end();
  });

  readable.on("readable", function() {
    if (self._waiting) {
      self._waiting = false;
      self._read();
    }
  });

  readable.once("end", function() {
    self.push(null);
  });

  if (!options || typeof options.bubbleErrors === "undefined" || options.bubbleErrors) {
    writable.on("error", function(err) {
      self.emit("error", err);
    });

    readable.on("error", function(err) {
      self.emit("error", err);
    });
  }
}

DuplexWrapper.prototype = Object.create(stream.Duplex.prototype, {constructor: {value: DuplexWrapper}});

DuplexWrapper.prototype._write = function _write(input, encoding, done) {
  this._writable.write(input, encoding, done);
};

DuplexWrapper.prototype._read = function _read() {
  var buf;
  var reads = 0;
  while ((buf = this._readable.read()) !== null) {
    this.push(buf);
    reads++;
  }
  if (reads === 0) {
    this._waiting = true;
  }
};

module.exports = function duplex2(options, writable, readable) {
  return new DuplexWrapper(options, writable, readable);
};

module.exports.DuplexWrapper = DuplexWrapper;


/***/ }),

/***/ 747:
/***/ (function(module) {

module.exports = require("fs");

/***/ }),

/***/ 761:
/***/ (function(module) {

module.exports = require("zlib");

/***/ }),

/***/ 774:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const urlLib = __webpack_require__(835);
const http = __webpack_require__(605);
const PCancelable = __webpack_require__(557);
const is = __webpack_require__(534);

class GotError extends Error {
	constructor(message, error, options) {
		super(message);
		Error.captureStackTrace(this, this.constructor);
		this.name = 'GotError';

		if (!is.undefined(error.code)) {
			this.code = error.code;
		}

		Object.assign(this, {
			host: options.host,
			hostname: options.hostname,
			method: options.method,
			path: options.path,
			socketPath: options.socketPath,
			protocol: options.protocol,
			url: options.href,
			gotOptions: options
		});
	}
}

module.exports.GotError = GotError;

module.exports.CacheError = class extends GotError {
	constructor(error, options) {
		super(error.message, error, options);
		this.name = 'CacheError';
	}
};

module.exports.RequestError = class extends GotError {
	constructor(error, options) {
		super(error.message, error, options);
		this.name = 'RequestError';
	}
};

module.exports.ReadError = class extends GotError {
	constructor(error, options) {
		super(error.message, error, options);
		this.name = 'ReadError';
	}
};

module.exports.ParseError = class extends GotError {
	constructor(error, statusCode, options, data) {
		super(`${error.message} in "${urlLib.format(options)}": \n${data.slice(0, 77)}...`, error, options);
		this.name = 'ParseError';
		this.statusCode = statusCode;
		this.statusMessage = http.STATUS_CODES[this.statusCode];
	}
};

module.exports.HTTPError = class extends GotError {
	constructor(response, options) {
		const {statusCode} = response;
		let {statusMessage} = response;

		if (statusMessage) {
			statusMessage = statusMessage.replace(/\r?\n/g, ' ').trim();
		} else {
			statusMessage = http.STATUS_CODES[statusCode];
		}

		super(`Response code ${statusCode} (${statusMessage})`, {}, options);
		this.name = 'HTTPError';
		this.statusCode = statusCode;
		this.statusMessage = statusMessage;
		this.headers = response.headers;
		this.body = response.body;
	}
};

module.exports.MaxRedirectsError = class extends GotError {
	constructor(statusCode, redirectUrls, options) {
		super('Redirected 10 times. Aborting.', {}, options);
		this.name = 'MaxRedirectsError';
		this.statusCode = statusCode;
		this.statusMessage = http.STATUS_CODES[this.statusCode];
		this.redirectUrls = redirectUrls;
	}
};

module.exports.UnsupportedProtocolError = class extends GotError {
	constructor(options) {
		super(`Unsupported protocol "${options.protocol}"`, {}, options);
		this.name = 'UnsupportedProtocolError';
	}
};

module.exports.TimeoutError = class extends GotError {
	constructor(error, options) {
		super(error.message, {code: 'ETIMEDOUT'}, options);
		this.name = 'TimeoutError';
		this.event = error.event;
	}
};

module.exports.CancelError = PCancelable.CancelError;


/***/ }),

/***/ 784:
/***/ (function(module, __unusedexports, __webpack_require__) {

/**
 * Detect Electron renderer process, which is node, but we should
 * treat as a browser.
 */

if (typeof process !== 'undefined' && process.type === 'renderer') {
  module.exports = __webpack_require__(408);
} else {
  module.exports = __webpack_require__(81);
}


/***/ }),

/***/ 794:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const {PassThrough} = __webpack_require__(413);
const duplexer3 = __webpack_require__(718);
const requestAsEventEmitter = __webpack_require__(584);
const {HTTPError, ReadError} = __webpack_require__(774);

module.exports = options => {
	const input = new PassThrough();
	const output = new PassThrough();
	const proxy = duplexer3(input, output);
	const piped = new Set();
	let isFinished = false;

	options.retry.retries = () => 0;

	if (options.body) {
		proxy.write = () => {
			throw new Error('Got\'s stream is not writable when the `body` option is used');
		};
	}

	const emitter = requestAsEventEmitter(options, input);

	// Cancels the request
	proxy._destroy = emitter.abort;

	emitter.on('response', response => {
		const {statusCode} = response;

		response.on('error', error => {
			proxy.emit('error', new ReadError(error, options));
		});

		if (options.throwHttpErrors && statusCode !== 304 && (statusCode < 200 || statusCode > 299)) {
			proxy.emit('error', new HTTPError(response, options), null, response);
			return;
		}

		isFinished = true;

		response.pipe(output);

		for (const destination of piped) {
			if (destination.headersSent) {
				continue;
			}

			for (const [key, value] of Object.entries(response.headers)) {
				// Got gives *decompressed* data. Overriding `content-encoding` header would result in an error.
				// It's not possible to decompress already decompressed data, is it?
				const allowed = options.decompress ? key !== 'content-encoding' : true;
				if (allowed) {
					destination.setHeader(key, value);
				}
			}

			destination.statusCode = response.statusCode;
		}

		proxy.emit('response', response);
	});

	[
		'error',
		'request',
		'redirect',
		'uploadProgress',
		'downloadProgress'
	].forEach(event => emitter.on(event, (...args) => proxy.emit(event, ...args)));

	const pipe = proxy.pipe.bind(proxy);
	const unpipe = proxy.unpipe.bind(proxy);
	proxy.pipe = (destination, options) => {
		if (isFinished) {
			throw new Error('Failed to pipe. The response has been emitted already.');
		}

		const result = pipe(destination, options);

		if (Reflect.has(destination, 'setHeader')) {
			piped.add(destination);
		}

		return result;
	};

	proxy.unpipe = stream => {
		piped.delete(stream);
		return unpipe(stream);
	};

	return proxy;
};


/***/ }),

/***/ 798:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const pkg = __webpack_require__(482);
const create = __webpack_require__(338);

const defaults = {
	options: {
		retry: {
			retries: 2,
			methods: [
				'GET',
				'PUT',
				'HEAD',
				'DELETE',
				'OPTIONS',
				'TRACE'
			],
			statusCodes: [
				408,
				413,
				429,
				500,
				502,
				503,
				504
			],
			errorCodes: [
				'ETIMEDOUT',
				'ECONNRESET',
				'EADDRINUSE',
				'ECONNREFUSED',
				'EPIPE',
				'ENOTFOUND',
				'ENETUNREACH',
				'EAI_AGAIN'
			]
		},
		headers: {
			'user-agent': `${pkg.name}/${pkg.version} (https://github.com/sindresorhus/got)`
		},
		hooks: {
			beforeRequest: [],
			beforeRedirect: [],
			beforeRetry: [],
			afterResponse: []
		},
		decompress: true,
		throwHttpErrors: true,
		followRedirect: true,
		stream: false,
		form: false,
		json: false,
		cache: false,
		useElectronNet: false
	},
	mutableDefaults: false
};

const got = create(defaults);

module.exports = got;


/***/ }),

/***/ 811:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const is = __webpack_require__(534);

module.exports = url => {
	const options = {
		protocol: url.protocol,
		hostname: url.hostname.startsWith('[') ? url.hostname.slice(1, -1) : url.hostname,
		hash: url.hash,
		search: url.search,
		pathname: url.pathname,
		href: url.href
	};

	if (is.string(url.port) && url.port.length > 0) {
		options.port = Number(url.port);
	}

	if (url.username || url.password) {
		options.auth = `${url.username}:${url.password}`;
	}

	options.path = is.null(url.search) ? url.pathname : `${url.pathname}${url.search}`;

	return options;
};


/***/ }),

/***/ 821:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const {URL} = __webpack_require__(835);
const is = __webpack_require__(534);
const knownHookEvents = __webpack_require__(433);

const merge = (target, ...sources) => {
	for (const source of sources) {
		for (const [key, sourceValue] of Object.entries(source)) {
			if (is.undefined(sourceValue)) {
				continue;
			}

			const targetValue = target[key];
			if (is.urlInstance(targetValue) && (is.urlInstance(sourceValue) || is.string(sourceValue))) {
				target[key] = new URL(sourceValue, targetValue);
			} else if (is.plainObject(sourceValue)) {
				if (is.plainObject(targetValue)) {
					target[key] = merge({}, targetValue, sourceValue);
				} else {
					target[key] = merge({}, sourceValue);
				}
			} else if (is.array(sourceValue)) {
				target[key] = merge([], sourceValue);
			} else {
				target[key] = sourceValue;
			}
		}
	}

	return target;
};

const mergeOptions = (...sources) => {
	sources = sources.map(source => source || {});
	const merged = merge({}, ...sources);

	const hooks = {};
	for (const hook of knownHookEvents) {
		hooks[hook] = [];
	}

	for (const source of sources) {
		if (source.hooks) {
			for (const hook of knownHookEvents) {
				hooks[hook] = hooks[hook].concat(source.hooks[hook]);
			}
		}
	}

	merged.hooks = hooks;

	return merged;
};

const mergeInstances = (instances, methods) => {
	const handlers = instances.map(instance => instance.defaults.handler);
	const size = instances.length - 1;

	return {
		methods,
		options: mergeOptions(...instances.map(instance => instance.defaults.options)),
		handler: (options, next) => {
			let iteration = -1;
			const iterate = options => handlers[++iteration](options, iteration === size ? next : iterate);

			return iterate(options);
		}
	};
};

module.exports = merge;
module.exports.options = mergeOptions;
module.exports.instances = mergeInstances;


/***/ }),

/***/ 835:
/***/ (function(module) {

module.exports = require("url");

/***/ }),

/***/ 861:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const PassThrough = __webpack_require__(413).PassThrough;
const zlib = __webpack_require__(761);
const mimicResponse = __webpack_require__(89);

module.exports = response => {
	// TODO: Use Array#includes when targeting Node.js 6
	if (['gzip', 'deflate'].indexOf(response.headers['content-encoding']) === -1) {
		return response;
	}

	const unzip = zlib.createUnzip();
	const stream = new PassThrough();

	mimicResponse(response, stream);

	unzip.on('error', err => {
		if (err.code === 'Z_BUF_ERROR') {
			stream.end();
			return;
		}

		stream.emit('error', err);
	});

	response.pipe(unzip).pipe(stream);

	return stream;
};


/***/ }),

/***/ 867:
/***/ (function(module) {

module.exports = require("tty");

/***/ }),

/***/ 880:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var debug = __webpack_require__(784)('argument-vector');

function Parser(options) {
  if (!(this instanceof Parser)) return new Parser(options);
}

Parser.prototype.parse = function(line){
  debug('parse("%s")', line);
  var orig = line = line.replace(/\\\n/g, '').trim();
  var c, i = 0, len = line.length;
  var args = [], arg, quot, q;

  for (; i < len; i++) {
    c = line.charAt(i);
    switch (c) {
    case ' ':
      if (!quot) {
        if (arg) {
          args.push(arg.trim());
          arg = null;
        }
      } else {
        arg += c;
      }
      break;
    case '\'':
    case '\"':
      if (!quot) {
        if (i === 0 || line.charAt(i-1) !== '\\') {
          quot = c;
          if (arg) { 
            arg += c;
          } else {
            arg = c;
          }
        }
      } else {
        arg += c;
        if (quot === c && line.charAt(i-1) !== '\\') {
          quot = null;
        }
      }
      break;
    default:
      if (arg) { 
        arg += c;
      } else {
        arg = c;
      }
    }
  }

  if (arg) {
    args.push(arg.trim());
    arg = null;
  }

  return args;
};

Parser.prototype.stringify = function(array){
  return array.join(' ');
};

module.exports = Parser;

/***/ }),

/***/ 916:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const EventEmitter = __webpack_require__(614);
const getStream = __webpack_require__(705);
const is = __webpack_require__(534);
const PCancelable = __webpack_require__(557);
const requestAsEventEmitter = __webpack_require__(584);
const {HTTPError, ParseError, ReadError} = __webpack_require__(774);
const {options: mergeOptions} = __webpack_require__(821);
const {reNormalize} = __webpack_require__(86);

const asPromise = options => {
	const proxy = new EventEmitter();

	const promise = new PCancelable((resolve, reject, onCancel) => {
		const emitter = requestAsEventEmitter(options);

		onCancel(emitter.abort);

		emitter.on('response', async response => {
			proxy.emit('response', response);

			const stream = is.null(options.encoding) ? getStream.buffer(response) : getStream(response, options);

			let data;
			try {
				data = await stream;
			} catch (error) {
				reject(new ReadError(error, options));
				return;
			}

			const limitStatusCode = options.followRedirect ? 299 : 399;

			response.body = data;

			try {
				for (const [index, hook] of Object.entries(options.hooks.afterResponse)) {
					// eslint-disable-next-line no-await-in-loop
					response = await hook(response, updatedOptions => {
						updatedOptions = reNormalize(mergeOptions(options, {
							...updatedOptions,
							retry: 0,
							throwHttpErrors: false
						}));

						// Remove any further hooks for that request, because we we'll call them anyway.
						// The loop continues. We don't want duplicates (asPromise recursion).
						updatedOptions.hooks.afterResponse = options.hooks.afterResponse.slice(0, index);

						return asPromise(updatedOptions);
					});
				}
			} catch (error) {
				reject(error);
				return;
			}

			const {statusCode} = response;

			if (options.json && response.body) {
				try {
					response.body = JSON.parse(response.body);
				} catch (error) {
					if (statusCode >= 200 && statusCode < 300) {
						const parseError = new ParseError(error, statusCode, options, data);
						Object.defineProperty(parseError, 'response', {value: response});
						reject(parseError);
						return;
					}
				}
			}

			if (statusCode !== 304 && (statusCode < 200 || statusCode > limitStatusCode)) {
				const error = new HTTPError(response, options);
				Object.defineProperty(error, 'response', {value: response});
				if (emitter.retry(error) === false) {
					if (options.throwHttpErrors) {
						reject(error);
						return;
					}

					resolve(response);
				}

				return;
			}

			resolve(response);
		});

		emitter.once('error', reject);
		[
			'request',
			'redirect',
			'uploadProgress',
			'downloadProgress'
		].forEach(event => emitter.on(event, (...args) => proxy.emit(event, ...args)));
	});

	promise.on = (name, fn) => {
		proxy.on(name, fn);
		return promise;
	};

	return promise;
};

module.exports = asPromise;


/***/ }),

/***/ 946:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const EventEmitter = __webpack_require__(614);
const urlLib = __webpack_require__(835);
const normalizeUrl = __webpack_require__(53);
const getStream = __webpack_require__(145);
const CachePolicy = __webpack_require__(154);
const Response = __webpack_require__(93);
const lowercaseKeys = __webpack_require__(97);
const cloneResponse = __webpack_require__(325);
const Keyv = __webpack_require__(303);

class CacheableRequest {
	constructor(request, cacheAdapter) {
		if (typeof request !== 'function') {
			throw new TypeError('Parameter `request` must be a function');
		}

		this.cache = new Keyv({
			uri: typeof cacheAdapter === 'string' && cacheAdapter,
			store: typeof cacheAdapter !== 'string' && cacheAdapter,
			namespace: 'cacheable-request'
		});

		return this.createCacheableRequest(request);
	}

	createCacheableRequest(request) {
		return (opts, cb) => {
			let url;
			if (typeof opts === 'string') {
				url = normalizeUrlObject(urlLib.parse(opts));
				opts = {};
			} else if (opts instanceof urlLib.URL) {
				url = normalizeUrlObject(urlLib.parse(opts.toString()));
				opts = {};
			} else {
				const [pathname, ...searchParts] = (opts.path || '').split('?');
				const search = searchParts.length > 0 ?
					`?${searchParts.join('?')}` :
					'';
				url = normalizeUrlObject({ ...opts, pathname, search });
			}

			opts = {
				headers: {},
				method: 'GET',
				cache: true,
				strictTtl: false,
				automaticFailover: false,
				...opts,
				...urlObjectToRequestOptions(url)
			};
			opts.headers = lowercaseKeys(opts.headers);

			const ee = new EventEmitter();
			const normalizedUrlString = normalizeUrl(
				urlLib.format(url),
				{
					stripWWW: false,
					removeTrailingSlash: false,
					stripAuthentication: false
				}
			);
			const key = `${opts.method}:${normalizedUrlString}`;
			let revalidate = false;
			let madeRequest = false;

			const makeRequest = opts => {
				madeRequest = true;
				let requestErrored = false;
				let requestErrorCallback;

				const requestErrorPromise = new Promise(resolve => {
					requestErrorCallback = () => {
						if (!requestErrored) {
							requestErrored = true;
							resolve();
						}
					};
				});

				const handler = response => {
					if (revalidate && !opts.forceRefresh) {
						response.status = response.statusCode;
						const revalidatedPolicy = CachePolicy.fromObject(revalidate.cachePolicy).revalidatedPolicy(opts, response);
						if (!revalidatedPolicy.modified) {
							const headers = revalidatedPolicy.policy.responseHeaders();
							response = new Response(revalidate.statusCode, headers, revalidate.body, revalidate.url);
							response.cachePolicy = revalidatedPolicy.policy;
							response.fromCache = true;
						}
					}

					if (!response.fromCache) {
						response.cachePolicy = new CachePolicy(opts, response, opts);
						response.fromCache = false;
					}

					let clonedResponse;
					if (opts.cache && response.cachePolicy.storable()) {
						clonedResponse = cloneResponse(response);

						(async () => {
							try {
								const bodyPromise = getStream.buffer(response);

								await Promise.race([
									requestErrorPromise,
									new Promise(resolve => response.once('end', resolve))
								]);

								if (requestErrored) {
									return;
								}

								const body = await bodyPromise;

								const value = {
									cachePolicy: response.cachePolicy.toObject(),
									url: response.url,
									statusCode: response.fromCache ? revalidate.statusCode : response.statusCode,
									body
								};

								let ttl = opts.strictTtl ? response.cachePolicy.timeToLive() : undefined;
								if (opts.maxTtl) {
									ttl = ttl ? Math.min(ttl, opts.maxTtl) : opts.maxTtl;
								}

								await this.cache.set(key, value, ttl);
							} catch (error) {
								ee.emit('error', new CacheableRequest.CacheError(error));
							}
						})();
					} else if (opts.cache && revalidate) {
						(async () => {
							try {
								await this.cache.delete(key);
							} catch (error) {
								ee.emit('error', new CacheableRequest.CacheError(error));
							}
						})();
					}

					ee.emit('response', clonedResponse || response);
					if (typeof cb === 'function') {
						cb(clonedResponse || response);
					}
				};

				try {
					const req = request(opts, handler);
					req.once('error', requestErrorCallback);
					req.once('abort', requestErrorCallback);
					ee.emit('request', req);
				} catch (error) {
					ee.emit('error', new CacheableRequest.RequestError(error));
				}
			};

			(async () => {
				const get = async opts => {
					await Promise.resolve();

					const cacheEntry = opts.cache ? await this.cache.get(key) : undefined;
					if (typeof cacheEntry === 'undefined') {
						return makeRequest(opts);
					}

					const policy = CachePolicy.fromObject(cacheEntry.cachePolicy);
					if (policy.satisfiesWithoutRevalidation(opts) && !opts.forceRefresh) {
						const headers = policy.responseHeaders();
						const response = new Response(cacheEntry.statusCode, headers, cacheEntry.body, cacheEntry.url);
						response.cachePolicy = policy;
						response.fromCache = true;

						ee.emit('response', response);
						if (typeof cb === 'function') {
							cb(response);
						}
					} else {
						revalidate = cacheEntry;
						opts.headers = policy.revalidationHeaders(opts);
						makeRequest(opts);
					}
				};

				const errorHandler = error => ee.emit('error', new CacheableRequest.CacheError(error));
				this.cache.once('error', errorHandler);
				ee.on('response', () => this.cache.removeListener('error', errorHandler));

				try {
					await get(opts);
				} catch (error) {
					if (opts.automaticFailover && !madeRequest) {
						makeRequest(opts);
					}

					ee.emit('error', new CacheableRequest.CacheError(error));
				}
			})();

			return ee;
		};
	}
}

function urlObjectToRequestOptions(url) {
	const options = { ...url };
	options.path = `${url.pathname || '/'}${url.search || ''}`;
	delete options.pathname;
	delete options.search;
	return options;
}

function normalizeUrlObject(url) {
	// If url was parsed by url.parse or new URL:
	// - hostname will be set
	// - host will be hostname[:port]
	// - port will be set if it was explicit in the parsed string
	// Otherwise, url was from request options:
	// - hostname or host may be set
	// - host shall not have port encoded
	return {
		protocol: url.protocol,
		auth: url.auth,
		hostname: url.hostname || url.host || 'localhost',
		port: url.port,
		pathname: url.pathname,
		search: url.search
	};
}

CacheableRequest.RequestError = class extends Error {
	constructor(error) {
		super(error.message);
		this.name = 'RequestError';
		Object.assign(this, error);
	}
};

CacheableRequest.CacheError = class extends Error {
	constructor(error) {
		super(error.message);
		this.name = 'CacheError';
		Object.assign(this, error);
	}
};

module.exports = CacheableRequest;


/***/ }),

/***/ 952:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const {Readable} = __webpack_require__(413);

module.exports = input => (
	new Readable({
		read() {
			this.push(input);
			this.push(null);
		}
	})
);


/***/ }),

/***/ 958:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tls_1 = __webpack_require__(16);
const deferToConnect = (socket, fn) => {
    let listeners;
    if (typeof fn === 'function') {
        const connect = fn;
        listeners = { connect };
    }
    else {
        listeners = fn;
    }
    const hasConnectListener = typeof listeners.connect === 'function';
    const hasSecureConnectListener = typeof listeners.secureConnect === 'function';
    const hasCloseListener = typeof listeners.close === 'function';
    const onConnect = () => {
        if (hasConnectListener) {
            listeners.connect();
        }
        if (socket instanceof tls_1.TLSSocket && hasSecureConnectListener) {
            if (socket.authorized) {
                listeners.secureConnect();
            }
            else {
                socket.once('secureConnect', listeners.secureConnect);
            }
        }
        if (hasCloseListener) {
            socket.once('close', listeners.close);
        }
    };
    if (socket.writable && !socket.connecting) {
        onConnect();
    }
    else if (socket.connecting) {
        socket.once('connect', onConnect);
    }
    else if (socket.destroyed && hasCloseListener) {
        listeners.close(socket._hadError);
    }
};
exports.default = deferToConnect;
// For CommonJS default export support
module.exports = deferToConnect;
module.exports.default = deferToConnect;


/***/ }),

/***/ 966:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const {PassThrough: PassThroughStream} = __webpack_require__(413);

module.exports = options => {
	options = {...options};

	const {array} = options;
	let {encoding} = options;
	const isBuffer = encoding === 'buffer';
	let objectMode = false;

	if (array) {
		objectMode = !(encoding || isBuffer);
	} else {
		encoding = encoding || 'utf8';
	}

	if (isBuffer) {
		encoding = null;
	}

	const stream = new PassThroughStream({objectMode});

	if (encoding) {
		stream.setEncoding(encoding);
	}

	let length = 0;
	const chunks = [];

	stream.on('data', chunk => {
		chunks.push(chunk);

		if (objectMode) {
			length = chunks.length;
		} else {
			length += chunk.length;
		}
	});

	stream.getBufferedValue = () => {
		if (array) {
			return chunks;
		}

		return isBuffer ? Buffer.concat(chunks, length) : chunks.join('');
	};

	stream.getBufferedLength = () => length;

	return stream;
};


/***/ }),

/***/ 986:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tr = __webpack_require__(9);
/**
 * Exec a command.
 * Output will be streamed to the live console.
 * Returns promise with return code
 *
 * @param     commandLine        command to execute (can include additional args). Must be correctly escaped.
 * @param     args               optional arguments for tool. Escaping is handled by the lib.
 * @param     options            optional exec options.  See ExecOptions
 * @returns   Promise<number>    exit code
 */
function exec(commandLine, args, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const commandArgs = tr.argStringToArray(commandLine);
        if (commandArgs.length === 0) {
            throw new Error(`Parameter 'commandLine' cannot be null or empty.`);
        }
        // Path to tool to execute should be first arg
        const toolPath = commandArgs[0];
        args = commandArgs.slice(1).concat(args || []);
        const runner = new tr.ToolRunner(toolPath, args, options);
        return runner.exec();
    });
}
exports.exec = exec;
//# sourceMappingURL=exec.js.map

/***/ })

/******/ });