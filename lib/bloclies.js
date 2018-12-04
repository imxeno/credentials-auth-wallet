module.exports = (opts) => {
	// The random number is a js implementation of the Xorshift PRNG
	var randseed = new Array(4); // Xorshift: [x, y, z, w] 32 bit values

	function seedrand(seed) {
		for (var i = 0; i < randseed.length; i++) {
			randseed[i] = 0;
		}
		for (var i = 0; i < seed.length; i++) {
			randseed[i%4] = ((randseed[i%4] << 5) - randseed[i%4]) + seed.charCodeAt(i);
		}
	}

	function rand() {
		// based on Java's String.hashCode(), expanded to 4 32bit values
		var t = randseed[0] ^ (randseed[0] << 11);

		randseed[0] = randseed[1];
		randseed[1] = randseed[2];
		randseed[2] = randseed[3];
		randseed[3] = (randseed[3] ^ (randseed[3] >> 19) ^ t ^ (t >> 8));

		return (randseed[3]>>>0) / ((1 << 31)>>>0);
	}

	function createColor() {
		return Math.floor(rand() * 231 + 1);
	}

	function createImageData(size) {
		var width = size; // Only support square icons for now
		var height = size;

		var dataWidth = Math.ceil(width / 2);
		var mirrorWidth = width - dataWidth;

		var data = [];
		for(var y = 0; y < height; y++) {
			var row = [];
			for(var x = 0; x < dataWidth; x++) {
				// this makes foreground and background color to have a 43% (1/2.3) probability
				// spot color has 13% chance
				row[x] = Math.floor(rand()*2.3);
			}
			var r = row.slice(0, mirrorWidth);
			r.reverse();
			row = row.concat(r);

			for(var i = 0; i < row.length; i++) {
				data.push(row[i]);
			}
		}

		return data;
	}

	function buildOpts(opts) {
		var newOpts = {};

		newOpts.seed = opts.seed || Math.floor((Math.random()*Math.pow(10,16))).toString(16);

		seedrand(newOpts.seed);

		newOpts.size = opts.size || 8;
		newOpts.scale = opts.scale || 4;
		newOpts.color = opts.color || createColor();
		newOpts.bgcolor = opts.bgcolor || createColor();
		newOpts.spotcolor = opts.spotcolor || createColor();

		return newOpts;
    }
    
    opts = buildOpts(opts || {});
    const imageData = createImageData(opts.size);
    const width = Math.sqrt(imageData.length);

    let grid = [];

    let i = 0;
    for(let y = 0; y < width; y++) {
        let row = [];
        for(let x = 0; x < width; x++) {
            switch(imageData[i]) {
                case 1:
                    row.push(opts.color);
                    break;
                case 2:
                    row.push(opts.spotcolor);
                    break;
                default:
                    row.push(opts.bgcolor);
            }
            i++;
        }
        grid.push(row);
    }

    console.log();
    for(let y = 0; y < width; y++) {
        for(let x = 0; x < width; x++) {
            process.stdout.write("\u001b[48;5;" + grid[y][x] + "m  ");
        }
        console.log("\u001b[0m");
    }
    console.log();
};