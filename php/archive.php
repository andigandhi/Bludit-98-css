<!doctype html>
<html>
<head>
	<link rel="stylesheet" href="https://unpkg.com/98.css" />
	<style>
	body {
	font-size: 130%;
	font-family: Georgia, 'Times New Roman', Times, serif;
	}
	h1 {
	font-size: 2rem;
	}
	h2 {
	font-size: 1.6rem;
	}
	h3,h4,h5 {
	font-size: 1.4rem;
	}
	</style>
	<meta charset="utf-8">
	<title>.</title>
</head>
<body>
    <?php
    global $pages;
    $list = $pages->getList(
      $pageNumber = 1,
      $numberOfItems = -1,
      $published = true,
      $static = false,
      $sticky = false,
      $draft = false,
      $scheduled = false
    );
    for ($i = Paginator::$pager['itemsPerPage']; $i < count($list); $i++) {
      try {
        // Create the page object from the page key
        $pageObj = new Page($list[$i]);
        if (!$pageObj->noindex()) {
          echo '<a href="' .
            $pageObj->permalink() .
            '?loadedFromIndex"><div class="menuButton" style="height: 30px">';
          if ($pageObj->coverImage() != '') {
            echo '<img alt="Icon for menu item ' .
              $pageObj->title() .
              '" src="' .
              $pageObj->coverImage() .
              '" style="width: 20px; margin: 5px; float:left;">';
          }
          echo '<div style="height: 20px;line-height: 20px;margin: 5px;float:left;"><b>' .
            $pageObj->title() .
            '</b></div></div></a>';
          echo $pageObj->description().'<hr>';
        }
      } catch (Exception $e) {
        // Continue
      }
    }
    ?>
</body>
</html>
