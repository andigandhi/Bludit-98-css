<meta charset="utf-8">
<meta name="generator" content="Bludit">

<!-- Dynamic title tag -->
<?php echo Theme::metaTags('title'); ?>

<!-- Dynamic description tag -->
<?php echo Theme::metaTags('description'); ?>

<!-- Include Favicon -->
<?php echo Theme::favicon('img/favicon.png'); ?>

<!-- Viewport -->
<meta name="viewport" content="width=device-width,initial-scale=1">

<!-- Include CSS Styles from this theme -->
<?php echo Theme::css('css/style.css'); ?>

<!-- Load CSS: 98.css -->
<link rel="stylesheet" href="https://unpkg.com/98.css" />

<!-- Load Bludit Plugins: Site head -->
<?php Theme::plugins('siteHead'); ?>

<!-- Script to add the move listener to the window divs -->
<?php echo Theme::js('js/windowMover.js'); ?>
<!-- Script to add drag-to-resize handles to windows -->
<?php echo Theme::js('js/windowResizer.js'); ?>
