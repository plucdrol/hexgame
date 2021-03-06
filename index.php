<html>
	<head>

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
					substr($filename,-2) != '\.' && 
					substr($filename,-3) != '\..' &&
					$filename != '.\HexGame.js');
			}

			function include_script($filename) {
				echo "<script src='".$filename."'></script>";
			}

		?>



		<style>
			html,body {
				height: 100%;
				width: 100%;
				margin:0;
				overflow:hidden;
			}
			body,p {
				background: black;
				color: white;
			}			
			#city-bar {
				position: absolute;
				left: 0;
				top: 0;
				right: 0;
				padding: 5px;
				background: grey;
				font-size: 2em;
			}
			#city-name {
				color: darkgreen;
			}
			#world-resources {
				float: right;
			}
			#mycanvas{
				background: black;
				clear: both;
				/*margin-top: 30px;*/
			}
			#tooltip {
				position: absolute;
				right: 0;
				bottom: 0;
				font-size: 2em;
				background: grey;
				padding: 5px;
			}

			.action-button {
				background: grey;
		    color: black;
		    padding: 0.2em 0.5em;
		    border: 2px solid darkgrey;
		    border-bottom-color: black;
		    border-right-color: black;
		    font-size: 1.5em;	
			}
			input [type="radio" i] {
				display: none;
			}
			input[type="radio"]:checked + .action-button {
			    background: #4a4949;
			    border-bottom-color: darkgrey;
			    border-right-color: darkgrey;
			    border-top-color: black;
			    border-left-color: black;
			    color: lightgrey;
			}

			input[type="radio"] {
			    display: none;
			}

			input[type="radio"][disabled] + .action-button {
				background: #aaa;
				color: #ccc;
				border-bottom-color: lightgrey;
		    border-right-color: lightgrey;
		    border-top-color: white;
		    border-left-color: white;
			}

		</style>
	</head>
	<body>
			<div id='city-bar'>
			<span id='city-name'>City</span>
			<span id='city-resources'></span>
			<span id='world-resources'></span>
		</div>
		<div style="float:left;">
			<canvas id="mycanvas" width="600" height="400">
				Your system does not support Canvas.
			</canvas>
		</div>
		
		<form id='action-buttons' style="position:absolute; bottom: 1em; left: 1em;";>
	  </form>	

		<div id='tooltip'>
			Nothing
		</div>

		<!-- Javascript after this line -->

	</body>


	<script src="HexGame.js">
		
	</script>

	
</html>//