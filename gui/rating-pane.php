<?php require 'base.php'; ?>
<div id="content-root" class="tab-pane">
    <div class="rating-box" style="margin-right: 30px; height: 500px; width: 200px;">
        <h4><?=_('Ignorieren')?>
            <div class="tooltip"><?=_('<b>Nicht bewertet:</b> Vorschl&auml;ge, die nicht bewertet wurden gelten als weniger
                relevant. Bitte lasse alle Technologien, die Du unwichtig findest oder zu denen Du keine klare Meinung
                hast in dieser Box!')?>
            </div>
        </h4>
        <ul id="rating-ignore" class="connectedSortable" style="height: 465px;">
        </ul>
    </div>

    <div class="rating-box">
        <h4><?=_('Einf&uuml;hren')?>
            <div class="tooltip"><?=_('<b>Einf&uuml;hren:</b> Vorschl&auml;ge, die noch nicht oder nur vereinzelt verwendet
                werden, aber deren breite Nutzung anzustreben ist.')?>
            </div>
        </h4>
        <ul id="rating-adopt" class="connectedSortable" style="height: 265px;">
        </ul>
    </div>

    <div class="rating-box">
        <h4><?=_('Testweise einsetzen')?>
            <div class="tooltip"><?=_('<b>Testweise einsetzen:</b> Vorschl&auml;ge die so interessant und Risikoarm sind, dass
                sie bereits vorsichtig und testweise eingesetzt werden sollten (insbesondere in nicht kritischen
                Komponenten).')?>
            </div>
        </h4>
        <ul id="rating-try" class="connectedSortable" style="height: 265px;">
        </ul>
    </div>

    <div class="rating-box">
        <h4><?=_('Bewerten/Evaluieren')?>
            <div class="tooltip"><?=_('<b>Bewerten/Evaluieren:</b> Vorschl&auml;ge, die angeschaut, bewertet und weiter
                beobachtet werden sollten.')?>
            </div>
        </h4>
        <ul id="rating-regard" class="connectedSortable" style="height: 265px;">
        </ul>
    </div>

    <div class="rating-box" style="height: 185px; width: 38%;">
        <h4><?=_('Beibehalten')?>
            <div class="tooltip"><?=_('<b>Beibehalten:</b> Vorschl&auml;ge, die schon in der Breite verwendet werden, evtl.
                nicht mehr der letzte Schrei sind, aber beibehalten werden sollen.')?>
            </div>
        </h4>
        <ul id="rating-hold" class="connectedSortable" style="height: 145px;">
        </ul>
    </div>

    <div class="rating-box" style="height: 185px; width: 38%;">
        <h4><?=_('Vermeiden/Abschaffen')?>
            <div class="tooltip"><?=_('<b>Vermeiden/Abschaffen:</b> Vorschl&auml;ge, die nicht verwendet werden sollten, egal
                ob sie aktuell eingesetzt werden, oder neue Vorschl&auml;ge sind.')?>
            </div>
        </h4>
        <ul id="rating-abolish" class="connectedSortable" style="height: 145px;">
        </ul>
    </div>
</div>
