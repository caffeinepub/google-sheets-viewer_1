import OutCall "http-outcalls/outcall";
import Runtime "mo:core/Runtime";



actor {
  type SheetUrl = Text;
  type CsvContent = Text;

  var googleSheetCsvExportUrl : SheetUrl = "https://docs.google.com/spreadsheets/d/1mYxpii0tgIQ0Z6pi3_x0ZUu2OS0ZLU3dT8H_bRjdUXk/gviz/tq?tqx=out:csv";

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func fetchGoogleSheetRaw() : async CsvContent {
    switch (googleSheetCsvExportUrl) {
      case ("") { Runtime.trap("No Google Sheets URL configured.") };
      case (url) {
        await OutCall.httpGetRequest(url, [], transform);
      };
    };
  };

  public shared ({ caller }) func fetchGoogleSheet() : async CsvContent {
    await fetchGoogleSheetRaw();
  };

  public shared ({ caller }) func setGoogleSheetsURL(url : SheetUrl) : async () {
    googleSheetCsvExportUrl := url;
  };

  public query ({ caller }) func getGoogleSheetsURL() : async SheetUrl {
    switch (googleSheetCsvExportUrl) {
      case ("") { Runtime.trap("URL not set yet") };
      case (url) { url };
    };
  };

  public query ({ caller }) func isValid() : async Bool {
    googleSheetCsvExportUrl != "";
  };
};
