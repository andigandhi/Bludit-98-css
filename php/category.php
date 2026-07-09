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
    <h1>Category: <?php
    global $categories;
    global $currentCategory;
    echo $categories->getName($currentCategory);
    ?></h1>
    <?php
    global $categories;
    global $currentCategory;

    foreach ($categories->getList($currentCategory, 1, -1) as $key => $value) {
        try {
          $pageObj = new Page($value);
          if (($pageObj->type() == 'published') ||
            ($pageObj->type() == 'sticky') ||
            ($pageObj->type() == 'static')
          ) {
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
          // continue
        }
    }
?>
</body>
</html>