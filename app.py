from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, MetaData, Table,Column
from flask import Flask, jsonify, render_template
import pandas as pd
import numpy as np
#################################################
# Flask Setup
#################################################
app = Flask(__name__)
#################################################
# Database Setup
#################################################
engine = create_engine("sqlite:///DataSets/belly_button_biodiversity.sqlite")
print("Connected to DB")


metadata = MetaData()
metadata.reflect(engine)
Base = automap_base()
Base.prepare(engine, reflect=True)

# mapped classes are ready
Otu =  Base.classes.otu
Samples = Base.classes.samples
Samples_Metadata = Base.classes.samples_metadata

# Create our session (link) from Python to the DB
session = Session(engine)

@app.route("/")
def home():
    """Render Home Page."""
    #return render_template("index.html")
    return render_template("index.html")

@app.route('/names')
def names():
    samples = metadata.tables['samples'].columns.keys()
    names = samples[1: len(samples)]
    return jsonify(names)

@app.route('/otu')
def sampleDesc():
    desc= session.query(Otu.lowest_taxonomic_unit_found).all()
    sample_desc = [ "%s" % x for x in desc ]
    return jsonify(sample_desc)

@app.route('/otu/<otuId>')
def sampleOtuDesc(otuId):
    print("otuId "+ otuId)
    desc= session.query(Otu.lowest_taxonomic_unit_found).filter(Otu.otu_id == otuId).first()
    print("desc "+ str(desc))
    sample_desc = [ "%s" % x for x in desc ]
    print("sample_desc "+ str(sample_desc))
    return jsonify(sample_desc)

@app.route('/metadata/<sample>')
def sampleMetadata(sample):
    sampleId = sample.split("_")[1]
    result= session.query(Samples_Metadata).filter(Samples_Metadata.SAMPLEID == sampleId).first()
    sample_metadata = vars(result)
    sample_metadata.pop('_sa_instance_state', None)
    return jsonify(sample_metadata)

@app.route('/wfreq/<sample>')
def washFrequency(sample):
    sampleId = sample.split("_")[1]
    freq= session.query(Samples_Metadata.WFREQ).filter(Samples_Metadata.SAMPLEID == sampleId).first()
    return jsonify(freq[0])

@app.route('/samples/<sample>')
def otuSampleValues(sample):
    sampleId = sample
    samples_df = pd.read_csv("DataSets/belly_button_biodiversity_samples.csv")
    #samples_df.head()
    otu_samples_df = samples_df[['otu_id', sampleId]]
    otu_samples_df = otu_samples_df.loc[otu_samples_df[sampleId] > 0]
    sorted_otu_samples_df = otu_samples_df.sort_values(by=sampleId, ascending=False)

    final_otuIds = list(sorted_otu_samples_df['otu_id'])
    list_otuIds = []
    for x in final_otuIds:
        list_otuIds.append( np.asscalar(x))
    final_sample_values = list(sorted_otu_samples_df[sampleId])
    list_sample_values = []
    for x in final_sample_values:
        list_sample_values.append( np.asscalar(x))
    otu_samples_dict = {'otu_ids': list_otuIds , 'sample_values': list_sample_values}
    print("otu_samples_dict " + str(otu_samples_dict))
    return jsonify(otu_samples_dict) 


if __name__ == '__main__':
    app.run(debug=True)