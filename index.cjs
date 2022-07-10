const fs = require("fs/promises")
const path = require("path")
const os = require("os")

const yargs = require("yargs/yargs")
const { hideBin } = require("yargs/helpers")

yargs(hideBin(process.argv))
  .command(
    "$0 <pathA> <pathB>",
    "Swap filenames of two files",
    async (yargs) => {
      return yargs
        .positional("pathA", {
          describe: "Path to the first file",
          type: "string",
        })
        .positional("pathB", {
          describe: "Path to the second file",
          type: "string",
        })
    },
    async ({ pathA, pathB }) => {
      if (!pathA.includes("/") || !pathB.includes("/")) {
        console.error("File paths must include a slash")
        return
      }

      try {
        const absPathA = path.resolve(pathA)
        const absPathB = path.resolve(pathB)
        const filenameA = path.basename(absPathA)
        const filenameB = path.basename(absPathB)

        // copy to temp directory first to make sure both files exist
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "swap-files-"))
        const tempNewA = `${tempDir}/${filenameA}`
        const tempNewB = `${tempDir}/${filenameB}`
        await fs.copyFile(absPathA, tempNewA)
        await fs.copyFile(absPathB, tempNewB)

        // copy back to original directory with names swapped
        await fs.copyFile(tempNewA, absPathB)
        await fs.copyFile(tempNewB, absPathA)

        console.log("Filenames swapped successfully")
      } catch (err) {
        console.error(err)
      }
    }
  )
  .parse()
