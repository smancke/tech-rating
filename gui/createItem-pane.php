<?php require 'base.php'; ?>
<div id="content-root" class="tab-pane">

    <div id="message-box" class=".success-message" style="height: 40px; width: 400px; padding: 15px; margin: 0; margin-top: 30px; display: none">
    </div>
    <div class="well" style="float: left">
        <ul id="ratingitem-list" style="height: 550px; width: 400px;"></ul>
    </div>
    <div class="well" style="float: left; margin-left: 20px; width: 400px;">
        <h4 id="itemPaneHeader"><?=_('Neuer Vorschlag ...')?></h4>

        <form id="itemEditForm" style="margin: 15px" action="" onsubmit="return false;" role="form">
            <input id="itemid" type="hidden" name="itemid"/>

            <div class="form-group">
                <label for="name"><?=_('Name:')?></label>
                <input class="form-control" id="name" type="text" name="name"/>
                <div class="tooltip"><?=_('Bitte einen kurzen sprechenden Namen verwenden.')?></div>
            </div>
            <div class="form-group">
                <label for="description"><?=_('Beschreibung:')?></label>
                <textarea class="form-control" id="description" style="height: 150px; width: 400px;" name="description"></textarea>
                <div class="tooltip"><?=_('Kurze Beschreibung in Deutsch eingeben.')?></div>
            </div>
            <div class="form-group">
                <label for="category"><?=_('Themenbereich:')?></label>
                <select class="form-control" id="category" name="category"></select>
                <div class="tooltip"><?=_('Bitte einen Themenbereich ausw&auml;hlen.')?></div>
            </div>
            <div class="form-group">
                <input class="btn btn-default" type="submit" value="<?=_('Speichern')?>"
                       onClick="itemPane.createOrUpdateItem(this.form.itemid.value, this.form.name.value, this.form.description.value, this.form.category.value)"/>
                <input class="btn btn-default" type="reset" value="<?=_('Zur&uuml;cksetzen')?>" onClick="itemPane.resetForm();"/>
            </div>
        </form>
    </div>
</div>
