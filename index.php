<html>
	<head>
		<link rel="stylesheet" type="text/css" href="style.css">
		<?php 

			// LOAD ALL SCRIPTS IN DIRECTORY AND SUBDIRECTORIES
		  //get local directory
      $directory = new RecursiveDirectoryIterator('.');

			foreach (new RecursiveIteratorIterator($directory) as $filename => $file) {
				if (filter_filename($filename))
    		  include_script($filename);
			}

			function filter_filename($filename) {
				return (
					$filename != '.\.' && 
					$filename != '.\..' && 
					substr($filename,0,7) != ".\.git\\" && 
					substr($filename,0,12) != ".\react-hud\\" && 
					substr($filename,-2) != '\.' && 
					substr($filename,-3) != '\..' &&
					$filename != '.\HexGame.js');
			}

			function include_script($filename) {
				echo "<script src='".$filename."'></script>";
			}

		?>

	</head>
	<body>

		<div id='world-bar'>
			<span id='free-ants'></span>
			<span id='total-ants'></span>
		</div>
		<form id='action-buttons' style="position:absolute; bottom: 1em; left: 1em;";>
	  </form>	
	  
		<div style="float:left;">
			<canvas id="mycanvas" width="600" height="400">
				Your system does not support Canvas.
			</canvas>
		</div>
		


		<div id='tooltip'>
			Nothing
		</div>

		<!-- Javascript after this line -->

	</body>


	<script src="HexGame.js">
		
	</script>

	
</html>//