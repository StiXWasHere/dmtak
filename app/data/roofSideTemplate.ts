export const roofSideTemplate: RoofSide = {
  id: "", // will be replaced when added
  name: "", // user will set this
  sections: [
    {
      id: "Hangranna",
      title: "Hängränna",
      fields: [
        { title: "300mm bred kondensremsa har monterats längs takfot och den passerar nedersta kanten med ca 10 mm", fieldId: "kondensremsa" },
        { title: "Rännkork monterade med rostfri rännkroksskruv. Minst 3 skruv per krok", fieldId: "Rännkrok" },
        { title: "Rännkork monterade med max cc 600mm och sista kroken ca 100mm från takets kant", fieldId: "Rännkrok2" },
        { title: "Hängränna har fall på minst 2,7mm/m mot stuprör och har inget bakfall", fieldId: "Hängrännafall" },
        { title: "Hängrännans fall-längd överskrider inte 10m per stuprör", fieldId: "Hängrännafall2" },
        { title: "Hängrännans framkant är lägre än dess bakkant och lutar med ca 6mm framåt", fieldId: "Framkant" },
        { title: "Hängrännan är skarvad med 100mm överlapp och har mjukfog i överlappningen", fieldId: "Skarvad" },
        { title: "Ränngaveln har monterats på ändar och har mjukfog i överlappning och i innehörn", fieldId: "Ränngavel" },
        { title: "Håltagningen i hängrännan är likvärdig i storlek jämfört med stuprörets diameter och är utförd med droppkant utan vassa kanter/taggar", fieldId: "HåltagningHängränna" },
        { title: "Hängrännans gavel avslutas ca 15mm från vindskiva/hinder", fieldId: "Hänggavel" },
        { title: "Skarvbit är inte kortare än 2000mm", fieldId: "Skarvbit" },
        { title: "Hängrännan är hel, ren, fri från bucklor och repor. Bättringsmålning har utförts med bättringsfärg av samma kulör och glans", fieldId: "Hängrännaskick" },
        { title: "Överspolningsskydd är monterat framför vinkelrännor och vid behov även vid utkastare vid takkupor", fieldId: "Overspolningsskydd" },
      ]
    },
    {
      id: "Fotranna",
      title: "Fotränna",
      fields: [
        { title: "Fotrännan är monterad enligt avtalad AMA hus. Om ej reglerat i avtal skall lägsta standard vara enligt AMA hus 14", fieldId: "Fotranna" },
        { title: "Vattkupa är fastsatt med minst 1mm dubbelvirad rostfri ståltråd och fäster in i fotrännans kant vid utkastaren", fieldId: "Vattkupa"},
      ]
    },
        {
      id: "Fotplat",
      title: "Fotplåt",
      fields: [
        { title: "Fotplåtens knäck är anpassad till takets lutning så att droppkant pekar ned mot hängrännan", fieldId: "Fotplat" },
        { title: "Fotplåten är monterad i rak linje längs takfoten", fieldId: "Fotplat2"},
        { title: "Fotplåtens droppkant paserar hängrännans omslag med minst 10mm", fieldId: "Fotplat3"},
        { title: "Fotplåtarna överlappar med varandra med 100mm", fieldId: "Fotplat4"},
        { title: "Inner och yttervinklar är utförda på ett fackmässigt och estetiskt sätt", fieldId: "VinklarFot"},
        { title: "Fotplåtens yttergavlar är utförda med uppvikt kant och med avöedare snett in mot hängrännan", fieldId: "Fotplat5"},
        { title: "Fotplåten är infäst med montageskruv, max cc 400mm mellan infästningar (gäller tak med pannor)", fieldId: "Fotplat6"},
        { title: "Skarvbit är inte kortare än 500mm", fieldId: "Skarvbit"},
      ]
    },
        {
      id: "Stupror",
      title: "Stuprör",
      fields: [
        { title: "Stuprör, rörböjar och lövsilar är monterade i rak lodrät linje", fieldId: "Stupror" },
        { title: "Stuprör och dess delar är överlappade minst 50mm och i vattenrinningens riktning", fieldId: "Stupror2"},
        { title: "Samtliga rörskarvar (och eventuella utkastare) är popnitade med 2st popnitar per skarv (i rörets höger och vänster sida)", fieldId: "Stupror3"},
        { title: "Rörfalsen pekar bort från fasaden (förutom mellanbiten mellan rörböjarna som ska peka uppåt)", fieldId: "Rorfals"},
        { title: "Rörsvep är monterade med max 2000mm mellan varandra", fieldId: "Rorsvep"},
        { title: "Varje enskilt stuprör har minst 2 svep", fieldId: "Svepror"},
        { title: "Översta och nedersta svep är monterade ca 100mm ifrån anslutande detalj (rörböj, brunnutkastare etc.)", fieldId: "Rordetalj"},
        { title: "Stiftsvep har en lutning svagt ner i framkant så att vatten inte rinner längs stiften mot fasaden", fieldId: "Stiftsvep"},
        { title: "Stiftsvep är stumma och har monterats med plugg i den putsade fasaden eller i tegelstenens fogar", fieldId: "Stiftsvep2"},
        { title: "Svepen är monterade med samma avstånd från fasaden så att stupröret löper parallellt med fasaden när det betraktas längs husväggen", fieldId: "Svepror2"},
        { title: "Nedersta delen av stupröret är minst 2 meter och fastsatt med minst 2 rörsvep", fieldId: "Nederstupror"},
        { title: "Nedersta rörsvepen är monterade med tillräckligt avstånd från brunnkastare för att tillåta den skjutas upp så att lövsilen kan demonteras", fieldId: "Rorsil"},
        { title: "Brunnutkastaren går ned i lövsilen", fieldId: "Brunnutkastare"},
        { title: "Stuprör är hela, rena och fria från bucklor och repor. Bättringsmålning har utförts med bättringsfärg av samma kulör och glans", fieldId: "Helastopror"},
      ]
    },
    {
      id: "Underlagspapp",
      title: "Underlagspapp",
      fields: [
        {
          title: "Underlagspappen överlappar fotplåten 150mm, plastremsan är avlägsnat från klisterkanten och pappen är limmad mot fotplåten med skarvklister",
          fieldId: "Underlagspapp1"
        },
        {
          title: "Underlagsappen är rak och slät",
          fieldId: "Underlagspapp2"
        },
        {
          title: "Underlagspappen är dragen upp på vindskivan och skyddar hela dess baksida",
          fieldId: "Underlagspapp3"
        },
        {
          title: "Vid skarvning är överlappen minst 150mm i bottenkant och som ökar med 300mm till i ovankant samt med skarvklister emellan och spik igenom båda lagrena så skarvarna inte kan blåsa upp",
          fieldId: "Underlagspapp4"
        },
        {
          title: "Samtliga synliga pappspik har täckts med skarvklister",
          fieldId: "Underlagspapp5"
        },
        {
          title: "Pappvåderna är monterade med klisterkant mot klisterkant och plastremsan är avlägsnat från klisterkanterna",
          fieldId: "Underlagspapp6"
        },
        {
          title: "Inga synliga skador / hål finns på underlagspappens yta",
          fieldId: "Underlagspapp7"
        }
      ]
    },
    {
      id: "Nockplanka",
      title: "Nockplanka",
      fields: [
        {
          title: "Nockplankan har kontrollerats så att det har korrekt höjd. Nockpannor ska vila både på nockplankan och takpannorna",
          fieldId: "Nockplanka1"
        },
        {
          title: "Nockplankan har monterats rak längs nocken och utan lutning i sidled",
          fieldId: "Nockplanka2"
        },
        {
          title: "Nockplankan är skråskruvad med 2st 100mm träskruv i samtliga takstolar",
          fieldId: "Nockplanka3"
        },
        {
          title: "Nockplankor skråskruvas ihop med varandra. Kortaste skarvbiten skall vila på minst 2 takstolar",
          fieldId: "Nockplanka4"
        }
      ]
    },
    {
      id: "Underbeslag",
      title: "Underbeslag",
      fields: [
        {
          title: "Underbeslag är monterade runt samtliga genomföringar och mot fasad som möter taket ovanifrån",
          fieldId: "Underbeslag1"
        },
        {
          title: "Underbeslaget har skruvats med montageskruv, max cc 400 mot tak och tillräckligt cc-avstånd mot genomföringen för plåt skall ligga tajt mot genomföringen. Skruv är anpassad för utomhusbruk",
          fieldId: "Underbeslag2"
        },
        {
          title: "Underbeslaget är klistrad mot pappen och är slät mot underlaget",
          fieldId: "Underbeslag3"
        },
        {
          title: "Underbeslaget har fogats mot genomföringens stomme",
          fieldId: "Underbeslag4"
        },
        {
          title: "Underbeslaget längs hindrets baksida är i en hel bit (ej skarvad) och underlagspappen överlappar underbeslagets med minst 100mm och är klistrad mot plåten",
          fieldId: "Underbeslag5"
        },
        {
          title: "Underbeslagets avledare är ca 20 mm hög och ej sprucken",
          fieldId: "Underbeslag6"
        },
        {
          title: "Underbeslaget för avloppsluftningsröret har en 10mm uppvikt kant som sluter mot och är fogat mot röret",
          fieldId: "Underbeslag7"
        }
      ]
    },
    {
      id: "StroBarlakt",
      title: "Strö & Bärläkt",
      fields: [
        {
          title: "Ströläkten är monterad 100mm från yttergavlar och med max cc 600mm mellan ströläkt",
          fieldId: "StroBarlakt1"
        },
        {
          title: "Ströläkten är infäst på så sätt att spiken/skruven inte sticker igenom till undersidan råsponten (på vinden eller tak/gavelsprång)",
          fieldId: "StroBarlakt2"
        },
        {
          title: "Ströläkten är ca 50mm ifrån fotplåtens droppknäck och löper hela vägen upp till nockplankan",
          fieldId: "StroBarlakt3"
        },
        {
          title: "På tak med diffusionsöppen duk har tätningsremsan monterats mellan ströläkt och duk",
          fieldId: "StroBarlakt4"
        },
        {
          title: "Längs valmnock ligger ströläkt dikt an valmnockplankan. Distanser har monterats efter behov, för infästning av kapade pannor längs valmnock",
          fieldId: "StroBarlakt5"
        },
        {
          title: "Ströläkt får ej monterats längs med vinkelrännan, små ströläktsbitar monteras i tak fallets riktning",
          fieldId: "StroBarlakt6"
        },
        {
          title: "Stödläkten är monterad på ströläkten, med sådan höjd att nedersta pannraden har samma lutning som resterande rader takpannor",
          fieldId: "StroBarlakt7"
        },
        {
          title: "Första bärläktsraden är anpassad till takets lutning så att vatten från takpannornas dalar droppar ned precis förbi fotplåten och att häftigt regn inte rinner över hängrännan. Vatten får inte droppa på underlagspappen",
          fieldId: "StroBarlakt8"
        },
        {
          title: "Stödläkten har monterats med rätt dimensionerade skruv så att skruven inte gör hål genom underlagspappen på fotplåten",
          fieldId: "StroBarlakt9"
        },
        {
          title: "Stödläkten vid takfot och vinkelränna är svartmålade",
          fieldId: "StroBarlakt10"
        },
        {
          title: "Bärläkten är monterade med rätt bärläktsavstånd enligt monteringsanvisningar för den specifika takpannan och taklutningen",
          fieldId: "StroBarlakt11"
        },
        {
          title: "Där lösa bärläktssteg ska monteras finns ej skarv i bärläkten, alternativt att skarven är förstärkt med en oskarvad underliggande bärläkt",
          fieldId: "StroBarlakt12"
        },
        {
          title: "Översta bärläkten ligger på ett avstånd från nockplankan så att pannans klack får plats men samtidigt inte för långt från nockplankan så att nockpannorna täcker takpannorna ordentligt och eventuella spikhål",
          fieldId: "StroBarlakt13"
        },
        {
          title: "Fågelband har monterats på samtliga stödläkt med piggarna vänd utåt och så att de inte passerar takpannornas nedersta kant",
          fieldId: "StroBarlakt14"
        }
      ]
    },
        {
      id: "Vindskivor",
      title: "Vindskivor",
      fields: [
        {
          title: "45x45mm reglar är monterade under språnget längs gavlarna och synliga delar av 45x45 regeln är färdigmålade",
          fieldId: "Vindskivor1"
        },
        {
          title: "Trekantslisten är skruvad ca cc 500mm med 75mm trallskruv som skruvas igenom råsponten in till 45x45 regeln undertill",
          fieldId: "Vindskivor2"
        },
        {
          title: "Översta vindskivan har monterats i rätt höjd för att gavelbeslaget inte skall tryckas upp av pannorna",
          fieldId: "Vindskivor3"
        },
        {
          title: "Vinskivorna är ej spruckna eller har stora glipor vid skarvarna",
          fieldId: "Vindskivor4"
        },
        {
          title: "Skruvhål och skarvar är fogade med akrylfog för utomhusbruk och bättringsmålats över. (OBS! Akrylfog får ej användas där slamfärg såsom faluröd eller trälasyr använts.)",
          fieldId: "Vindskivor5"
        },
        {
          title: "Skarv vid nock är utfört med lodrätt skarv (ej norsk skarv.)",
          fieldId: "Vindskivor6"
        },
        {
          title: "Skarvbitar är inte kortare än 1000mm",
          fieldId: "Vindskivor7"
        }
      ]
    },
    {
      id: "Takpannor",
      title: "Takpannor",
      fields: [
        {
          title: "Takpannorna är lagda i raka linjer",
          fieldId: "Takpannor1"
        },
        {
          title: "Randzoner är infästa enligt monteringsanvisningarna (vanligtvis 2 rader längs gavlar, takfot och nock samt 1 rad runt genomföringar. Samtliga takpannor skall fästas in vid lutning över 55grader",
          fieldId: "Takpannor2"
        },
        {
          title: "Nedersta pannraden har samma lutning som övriga takpannor",
          fieldId: "Takpannor3"
        },
        {
          title: "Vid mansardtak har takpannorna anpassats så att takpannorna har samma lutning som övriga takpannor samt att pannorna från övre takfallet skjuter förbi nedre takfallet pannor med ca 50mm",
          fieldId: "Takpannor4"
        },
        {
          title: "Takpannor längs vinkelrännor har inte stora glipor och är kapade rakt, parallellt med motsvarande sida och den kapade ytan är 50mm förbi stödläkten",
          fieldId: "Takpannor5"
        },
        {
          title: "Nedersta raden takpannor trycker inte upp gavelbeslaget",
          fieldId: "Takpannor6"
        },
        {
          title: "Takpannor vid taksäkerhetens konsoler och plåtbeslagning har endast få mm glipor",
          fieldId: "Takpannor7"
        },
        {
          title: "Där takpannor går under beslag längs gavlar, genomföringar och plåtvingar, ska takpannorna inte vara kapade i dalen så vatten rinner ner på underlagspappen",
          fieldId: "Takpannor8"
        },
        {
          title: "Takpannorna är hela utan knäckta hörn och utan produktionsfel i ytbeläggningen",
          fieldId: "Takpannor9"
        },
        {
          title: "Nockband är monterade längs nock och valmnockar. Vid formbara nockband skall den häftande delen tryckas mot och fästas ordentligt ned i varje pann-dal",
          fieldId: "Takpannor10"
        },
        {
          title: "Pannor och plåtdetaljer är rengjorda från kapdamm",
          fieldId: "Takpannor11"
        }
      ]
    },
    {
      id: "Vinkelränna",
      title: "Vinkelränna",
      fields: [
        {
          title: "Kondensremsa är monterad under vinkelrännan",
          fieldId: "Vinkelränna1"
        },
        {
          title: "Vinkelrännan är monterad stumt mot underlaget och har inga bucklor",
          fieldId: "Vinkelränna2"
        },
        {
          title: "Vinkelrännan är skarvad med minst dubbelfals under 18 grader (hakfals är ok över 18 grader) med falstätningsmedel i falsen",
          fieldId: "Vinkelränna3"
        },
        {
          title: "Vinkelrännan är infäst längs båda sidor, cc 400mm mellan infästningarna som skall vara av montage eller klammerskruv för utomhusbruk",
          fieldId: "Vinkelränna4"
        },
        {
          title: "Vinkelrännan är utförd med svångfals vid nockmötet som är kullslagen där pappen överlappar",
          fieldId: "Vinkelränna5"
        },
        {
          title: "Vinkelrännan avslutas med 30mm språng och med 10mm omslag",
          fieldId: "Vinkelränna6"
        },
        {
          title: "Underlagspapp överlappar vinkelrännan minst 100mm rakt skuren och fastlimmad längs sidorna",
          fieldId: "Vinkelränna7"
        },
        {
          title: "Vinkelrännan är fri från repor, sprickor och är vid behov bättringsmålad",
          fieldId: "Vinkelränna8"
        }
      ]
    },
    {
      id: "Nockpannor",
      title: "Nockpannor",
      fields: [
        {
          title: "Nockpannor av betong är spikade eller skruvade med rostfri infästning",
          fieldId: "Nockpannor1"
        },
        {
          title: "Nockpannor av lertegel är skruvade med rostfri skruv med tätbricka",
          fieldId: "Nockpannor2"
        },
        {
          title: "Nockpannor som överlappar gavelbeslag har kapats vid hörnen så att den ligger rakt och inte trycks upp av beslaget nämnvärt",
          fieldId: "Nockpannor3"
        },
        {
          title: "Där sista nockpannan inte kan fästas i befintligt hål skall nytt hål borras och nockpannan fästs in med rostfriskruv med tätbricka",
          fieldId: "Nockpannor4"
        },
        {
          title: "Nockpannor av betong överlappas med minst 80mm överlapp, fäst med rostfri kamspik eller skruv och fogmassa appliceras i en sträng tvärs pannan under den överlappande delen",
          fieldId: "Nockpannor5"
        },
        {
          title: "Sista nockpannan vid varje gavel är minst en halv nockpannas längd",
          fieldId: "Nockpannor6"
        },
        {
          title: "Vid Speciella nockpannor såsom T- eller X-nock har läggningen börjats utifrån dessa",
          fieldId: "Nockpannor7"
        }
      ]
    },
    {
      id: "Gavelbeslag",
      title: "Gavelbeslag",
      fields: [
        {
          title: "Gavelbeslagen ska vara monterade så de skjuter 15mm förbi vindskivornas ändar",
          fieldId: "Gavelbeslag1"
        },
        {
          title: "Gavelbeslag ska utföras med 100mm överlapp och utan skruv i överlappen",
          fieldId: "Gavelbeslag2"
        },
        {
          title: "Gavelbeslagen ska skruvas fast med farmarskruv med tätbricka ca 400mm jämt fördelade skruv",
          fieldId: "Gavelbeslag3"
        },
        {
          title: "Gavelbeslag skall monteras med den 90 gradiga vinkeln stumt mot vindskivan i rak linje och gavelbeslagens vingar skall inte luta upp eller ner",
          fieldId: "Gavelbeslag4"
        },
        {
          title: "Vid nockmötet skall den lodräta plåtdelen vara klippt lodrätt och skall skruvas fast med farmarskruv i skarven",
          fieldId: "Gavelbeslag5"
        },
        {
          title: "Kortaste skarvbit ska vara minst 1000mm",
          fieldId: "Gavelbeslag6"
        },
        {
          title: "Gavelbeslagen är rena och eventuella repor har målats med bättringsfärg av samma kulör och glans",
          fieldId: "Gavelbeslag7"
        }
      ]
    },
    {
      id: "Taksakerhet",
      title: "Taksäkerhet",
      fields: [
        {
          title: "Glidskydd finns vid uppstigning och tillträdesled till nödvändiga anordningar som ska servas (t.ex. sotning). Gäller endast hus med utvändig uppstigning",
          fieldId: "Taksakerhet1"
        },
        {
          title: "Bärläktssteg eller stege är monterade i rak linje uppåt (ej diagonalt). Vid glidskydd skall stegen monteras en pannbredd i sidled från glidskyddet",
          fieldId: "Taksakerhet2"
        },
        {
          title: "Konsol till taksäkerhet trycker inte ner mot takpannorna så att takpannorna knäcks om konsolen belastas",
          fieldId: "Taksakerhet3"
        },
        {
          title: "Fotplattorna är fastskruvade med minst 10 rostfria medföljande skruv. 2 i översta hålen, 2 i nedersta hålen och resterande 6 utspridda över fotplattan",
          fieldId: "Taksakerhet4"
        },
        {
          title: "Gångbryggor är monterade så att durken är vågrät",
          fieldId: "Taksakerhet5"
        },
        {
          title: "Gångbryggan avslutas 1500mm ifrån takets gavlar",
          fieldId: "Taksakerhet6"
        },
        {
          title: "Gångbrygga och snörasskydd sticker inte ut mer än 300mm förbi sista konsolen",
          fieldId: "Taksakerhet7"
        },
        {
          title: "Snedstag är monterade 1 per gångbrygga oavsett längd",
          fieldId: "Taksakerhet8"
        },
        {
          title: "Övriga taksäkerhetsdetaljer följer tillverkarens monteringsanvisningar",
          fieldId: "Taksakerhet9"
        }
      ]
    },
    {
      id: "OvrigPlatslageri",
      title: "Övrig plåtslageri",
      fields: [
        {
          title: "Plåtstosar är gjorda med skopa och är anpassade efter takpannorna så att de inte lyfter takpannorna mer än materialets tjocklek plus några millimeter",
          fieldId: "OvrigPlatslageri1"
        },
        {
          title: "Vingar längs nederbeslag och ståndskivor är anpassade så att de täcker över takpannorna med minst 100 mm",
          fieldId: "OvrigPlatslageri2"
        },
        {
          title: "Takluckan är monterad med uppställningsbara chaner, låsningsbeslag och handtag på insidan",
          fieldId: "OvrigPlatslageri3"
        },
        {
          title: "Samtliga bakstycken för taklucka, skorsten, ventilationshuv etc. överlappas av takpannorna 150mm, har trampskydd undertill och är utförd så att inga orimliga glipor i takpannorna förekommer, vid behov kapas den undre nedre förtjockningen av betongpannorna som vilar på plåten så att gliporna blir minimala",
          fieldId: "OvrigPlatslageri4"
        },
        {
          title: "Där vinkelrännans ände avslutar vid takyta (ej vid takfot) ska skopa monteras för att leda vattnet över takpannorna",
          fieldId: "OvrigPlatslageri5"
        },
        {
          title: "Bandtäckning är monterad enligt avtalad AMA hus. Om ej reglerat i avtal skall lägsta standard vara enligt AMA hus 14",
          fieldId: "OvrigPlatslageri6"
        },
        {
          title: "Bättringsmålning på övriga plåtbeslag är utförd med bättringsfärg av samma kulör och glans",
          fieldId: "OvrigPlatslageri7"
        }
      ]
    },
    {
      id: "Takdetaljer",
      title: "Takdetaljer",
      fields: [
        {
          title: "Hålpanna monterad enligt tillverkarens anvisningar och ansluten till avloppsröret i vinden utan krök uppåt",
          fieldId: "Takdetaljer1"
        },
        {
          title: "Frånluftshuv är fackmässigt montera och ansluten till ventilationsrör i vinden. Ansluts huven till köksfläkt eller annan värmekälla ska kanalen vara isolerad med 50mm brandsäker isolering som stenull eller likvärdig",
          fieldId: "Takdetaljer2"
        },
        {
          title: "Veluxfönster är monterade på 45x45mm regelstomme med underbeslag omkring det. Övrigt är det monterad enligt monteringsanvisningarna. Kapade takpannor i anslutning till fönstret som ej kan skruvas fast i läkten pga. Plåtkragen, ska limmas och hängas i ovanliggande bärläkten med rostfri ståltråd",
          fieldId: "Takdetaljer3"
        },
        {
          title: "Vid invändigt arbete av Veluxfönster ska ytan intill fönstret vara isolerad, och gamla ångspärren ansluten till befintlig ångspärr eller ångbroms. Har takstolsfack stängts av med kortlingar ska ventilation därtill återskapas med borrade hål i kortlingarna eller ventilationsbeslag över och under fönstret",
          fieldId: "Takdetaljer4"
        }
      ]
    }
  ]
};
