</div><!-- #content -->
</div><!-- #page -->

<div style="width: 100%;bottom: 2px;position: fixed;left: 2px;display: flex;align-items: center;justify-content: space-between;">
    <div style="display: flex;align-items: center;justify-content: center;">
        <a href="https://tapestry-tool.com" target="_blank" style="">
            <img width="60" height="60" src="http://localhost:8888/wp-content/plugins/tapestry/templates/img/TapestryLogo.png">
        </a>
        <div style="font-size:12px;margin: 20px 0 0 4px;white-space: nowrap;">Powered by Tapestry</div>
    </div>
    <?php if(isset($_GET['show-open-link'])): ?>
    <a href="<?php echo strtok($_SERVER["REQUEST_URI"], '?'); ?>" target="_blank" style="color:#000;font-size:12px;margin: 20px 20px 0 4px;white-space: nowrap;">
        Open this tapestry in a new window 
        <i class="fas fa-external-link-alt" style="color:#186d95"></i>
    </a>
    <?php endif; ?>
</div>
<?php wp_footer(); ?>
</body>
</html>