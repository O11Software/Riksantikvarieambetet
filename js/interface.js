function resetFilterList(){
    environmentFilterList.length = 0;
    let fillFilter = document.getElementsByClassName("items")[0];
    fillFilter.innerHTML = "";
}

function loadFilterList(element){
    if (element != null && (element.hasOwnProperty("Kulturmiljötyper kursiverade i text") || element.hasOwnProperty("culturalEnvironmentTypes"))) {
        kulturSplit = "";
        if(element.hasOwnProperty("Kulturmiljötyper kursiverade i text")){
            kulturSplit = element["Kulturmiljötyper kursiverade i text"].split(",");
        }
        else{
            kulturSplit = element["culturalEnvironmentTypes"].split(",");
        }
        kulturSplit.forEach(element => {
            element = String(element).trim().replace(".", "");
            element = element.charAt(0).toUpperCase() + element.slice(1);
            if (!environmentFilterList.includes(element) && element.length > 1 && !element.includes("Ingen information finns tillgänglig")) {
                environmentFilterList.push(element);
            }
        });
    }
}

function fillFilterList(){
    environmentFilterList.sort();
    let fillFilter = document.getElementsByClassName("items")[0];
    let filterHTMLBuilder = "";
    
    environmentFilterList.forEach(element => {
        filterHTMLBuilder += '<li><input type="checkbox" value="' + element + '" onclick="culturalEnvironmentFilter()"/>' + element + '</li>';
    });
    fillFilter.innerHTML = filterHTMLBuilder;
}

function showFoundInterests(filteredNationalInterests){
    let searchResultText = document.getElementById("number-of-elements");
    if (filteredNationalInterests.length > 0) {
      searchResultText.innerText = "Vi hittade " + filteredNationalInterests.length + " " + (filteredNationalInterests.length != 1 ? "riksintressen" : "riksintresse") + " som matchade din filtrering.";
      searchResultText.style.visibility = 'visible';
    }
    else {
      searchResultText.style.visibility = 'hidden';
    }
}

function loadMunicipalityList(){
    let countySearch = document.getElementById('county');
    if(countySearch.value.length == 0){
        municipalityFilterList.length = 0;
        municipalityFilterList = [...LIST_OF_MUNICIPALITY];
    }

    municipalityFilterList.sort(function(a, b){
        if(a.feature.properties.KnNamn < b.feature.properties.KnNamn) { return -1; }
        if(a.feature.properties.KnNamn > b.feature.properties.KnNamn) { return 1; }
        return 0;
    })
    municipalityElement.innerHTML = "";
    var municipalityListElement = document.createElement('option');
    municipalityListElement.innerHTML = "Kommun";
    municipalityListElement.value = "";
    municipalityElement.appendChild(municipalityListElement);

    municipalityFilterList.forEach(municipality => {
        var municipalityListElement = document.createElement('option');
        municipalityListElement.innerHTML = municipality.feature.properties.KnNamn;
        municipalityListElement.value = municipality.feature.properties.KnKod;
        municipalityElement.appendChild(municipalityListElement);
    });
}

function openInResultTable(id) {
    var coll = document.getElementsByClassName("collapsible");
    var i;
    for (i = 0; i < coll.length; i++) {
      if (coll[i].value == id) {
        coll[i].classList.add("highlight");
        coll[i].classList.add("active");
        var content = coll[i].nextElementSibling;
        openResult(content);
      }
    }
  }
  
  function resetHighlightResultTable() {
    var coll = document.getElementsByClassName("collapsible");
    var i;
    for (i = 0; i < coll.length; i++) {
      coll[i].classList.remove("highlight");
    }
  }
  
  function highlightOnResultTable(geoElement) {
    resetHighlightResultTable();
    var coll = document.getElementsByClassName("collapsible");
    var i;
    var foundInResultTable = false;
    for (i = 0; i < coll.length; i++) {
      if (coll[i].value == geoElement.feature.properties.RI_id) {
        coll[i].classList.add("highlight");
        foundInResultTable = true;
      }
    }
  
    if (!foundInResultTable) {
      if (coll.length >= 3) {
        for (i = coll.length-1; i >= 0; i--) {
          if (!coll[i].classList.contains("active")) {
            removeInterestFromResultTable(i);
            break;
          }
        }
      }
  
      let nationalInterestInformation = findConnectedInformation(geoElement);
      if (nationalInterestInformation != null) {
        addInterestToResultTable(nationalInterestInformation);
        coll[coll.length - 1].classList.add("highlight");
      }
    }
  }

  function clearResultTable() {
    let resultTable = document.getElementById("result-table");
    resultTable.innerHTML = "";
  }
  
  function removeInterestFromResultTable(index) {
    let resultTable = document.getElementById("result-table");
    resultTable.childNodes[index].remove();
  }
  
  function addInterestToResultTable(nationalInterestInformation) {
    let resultTable = document.getElementById("result-table");
    let htmlResult = `
    <button type="button" value="${nationalInterestInformation.id}" class="collapsible">${nationalInterestInformation.name}</button>
        <div class="content">
          <p class="title"><b>ID</b></p>
          <p class="result-id">${nationalInterestInformation.id}</p>
          <p class="title"><b>Län</b></p>
          <p>${nationalInterestInformation.county}</p>
          <p class="title"><b>Kommun</b></p>
          <p>${nationalInterestInformation.municipality}</p>
          ${nationalInterestInformation.culturalEnvironmentTypes != false ? '<p class="title"><b>Kulturmiljötyper</b></p><p>' + nationalInterestInformation.culturalEnvironmentTypes + '</p>' : ''}
          ${nationalInterestInformation.reason != false ? '<p class="title"><b>Motivering</b></p> <p>' + nationalInterestInformation.reason + '</p>' : ''}
          ${nationalInterestInformation.expression != false ? '<p class="title"><b>Uttryck</b></p><p>' + nationalInterestInformation.expression + '</p>' : ''}
          ${nationalInterestInformation.underInvestigation != false ? '<p class="title"><b>Utredningsområde</b></p><p>' + nationalInterestInformation.underInvestigation + '</p>' : ''}
          ${nationalInterestInformation.firstRevision != false ? '<p class="title"><b>Tidigare revidering</b></p><p>' + nationalInterestInformation.firstRevision + '</p>' : ''}
          ${nationalInterestInformation.latestRevision != false ? '<p class="title"><b>Senaste revidering</b></p><p>' + nationalInterestInformation.latestRevision + '</p>' : ''}  
        </div>`;
    let newResult = document.createElement('div');
    newResult.innerHTML = htmlResult;
    resultTable.append(newResult);
    addResultAnimation(nationalInterestInformation.id);
  }

const searchElement = document.querySelector('#search');
searchElement.addEventListener('change', (event) => {
  let filteredNationalInterests = searchNationalInterests();
  dimAllLayers();
  filteredNationalInterests.forEach(layer => {
    highlightLayer(layer);
  });

  let informationElement = searchNameAndID(event.target.value);
  flyToRiksintresse(informationElement);
});

const countyElement = document.querySelector('#county');
countyElement.addEventListener('change', () => {

  municipalityFilterList.length = 0;
  LIST_OF_MUNICIPALITY.forEach(municipality => {
    if (String(municipality.feature.properties.KnKod).substring(0, 2) == String(countyElement.value)) {
      municipalityFilterList.push(municipality);
    }
  });
  loadMunicipalityList();
  searchWithHighlight("county");
});

const municipalityElement = document.querySelector('#municipality');
municipalityElement.addEventListener('change', () => {
  searchWithHighlight("municipality");
});

function addResultAnimation(id) {
    var coll = document.getElementsByClassName("collapsible");
    var i;
    window.originalClearTimeout = window.clearTimeout;
    for (i = 0; i < coll.length; i++) {
      if (coll[i].value == id) {
        coll[i].addEventListener("click", function () {
          this.classList.toggle("active");
          var content = this.nextElementSibling;
          if (content.style.maxHeight) {
            content.style.maxHeight = null;
            content.style.visibility = "hidden";
          } else {
            if (content != null) {
              openResult(content);
            }
          }
        });
      }
    }
  }
  
  function openResult(content) {
    content.style.maxHeight = content.scrollHeight + "px";
    content.style.visibility = "visible";
  }
  