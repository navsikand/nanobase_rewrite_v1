export default function Tutorial() {
  return (
    <div className="">
      {/* Header text */}
      <div className="mx-auto mt-20 flex w-11/12 flex-col items-center justify-center lg:w-[65%]">
        <div>
          <h1 className="text-6xl font-bold">Uploading structures</h1>
        </div>
        <p className="mt-8">
          Any researcher who would like to deposit a structure into Nanobase is
          welcome to create an account. To begin, click the &quot;Sign in&quot;
          button in the upper right corner and select &quot;Create an
          account&quot;. Once you fill in the form and verify your email, you
          are ready to upload a structure.
        </p>

        <div className="mt-8 w-full space-y-3">
          <h2 className="text-4xl font-semibold">Uploading process</h2>
          <div className="mt-3 space-y-2">
            <p>
              Begin by clicking the &quot;Upload Structure&quot; button in the
              sidebar. This will take you to a form where you enter structure
              information. Make sure to include purpose and keywords to make the
              structure easily searchable by users in the future. The next page
              is where you enter publication information, including any patents
              and licensing information if applicable. Finally, on the file
              upload page you can include any files associated with an entry. At
              a minimum, we highly suggest uploading the following files:
            </p>
            <ul>
              <li>
                An original design file (for example, a Cadnano json file)
              </li>
              <li>
                At least one image (idealized, simulated or experimental) to be
                shown as the entry photo. If you do not have one available, you
                can use the oxView tool to produce such an image from the oxDNA
                files.
              </li>
              <li>
                If you also want the 3D structure viewer window to interactively
                display your structure, you will also need to convert your
                design file to oxDNA format. Note that providing oxDNA files is
                not necessary to upload structure, only recommended. The file
                converted to oxDNA format (using tacoxdna if your design tool of
                choice does not have a built-in exporter) should then be
                included in the list of the files that you upload. The following
                video demonstrates conversion from cadnano using oxView. If you
                are having trouble converting into oxDNA format, please do not
                hesitate to contact us.
              </li>
            </ul>

            <p>
              On this page you can also upload additional image files which will
              be shown in a gallery on the entry page, as well as experimental
              and simulation protocols and results which you would like to share
              with the wider community.
            </p>
          </div>
          <h2 className="text-4xl font-semibold">Private structures</h2>
          <div className="mt-3 space-y-2">
            <p>
              If you do not want your structure to be publicly avaialable, you
              can make it private by marking the checkbox in the last step of
              the upload process. This will prevent your structure from being
              searchable and appearing in the home page. Once uploaded, you will
              be taken your structure page. You may view your private structure
              by using the link for it or clicking &quot;View my
              structures&quot; in your Profile page. The structure will only be
              visible to anyone who has a link to it.
            </p>
            <p>
              If you select a private structure, you may chose to make your
              structure public at a later date (e.g. after being published).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
