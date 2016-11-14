 ## What does this script do?

This script is used to filter a jsonl file creating a new jsonl containing only the entries that match the PID's given as look up keys.

### Requirements at the moment:

- You need to include in data/ a csv file with the PID's for filtration.
	> The path to this file is harcoded at the moment in indixFiltering.js as csvPath variable. You have to change that path to specify your csv file.

- You need to include in data/ the source jsonl file or file to filter from. 
    > At the moment is harcoded in indixFilteringTools.js as lib.config.source (line 8 at the moment). Change this path to point to your source file.

Once you have included this to files, in order to run the script you have to open command line in src/ & run the command "node indixFiltering.js".

The results is gonna be write in data/output.jsonl. If you wanna store it in a different location, change the hardcoded value in lib.config.output 

### Possible improvements:
- Allow user to enter all the paths of the files by command line (keys for filtering, source & output) along to other options for the script. 