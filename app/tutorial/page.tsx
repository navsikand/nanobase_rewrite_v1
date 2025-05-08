export default function Tutorial() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Header text */}
      <div className="mt-20 flex w-full flex-col items-center justify-center lg:w-[65%]">
        <div>
          <h1 className="text-6xl font-bold">Uploading structures</h1>
        </div>
        <p className="mt-8 max-w-3xl text-lg text-gray-700">
          Any researcher who wants to deposit a structure into Nanobase can
          create an account. To begin, click the &quot;Sign in&quot; button in
          the upper right corner and select &quot;Create an account&quot;. Once
          you fill in the form and verify your email, you&apos;re ready to
          upload a structure.
        </p>

        <div className="mt-12 w-full">
          <h2 className="mb-6 text-4xl font-semibold">Uploading process</h2>

          <div className="space-y-6">
            <p className="text-lg text-gray-700">
              Begin by clicking the &quot;Upload Structure&quot; button in the
              sidebar. This will take you to a form where you enter structure
              information. Make sure to include purpose and keywords to make the
              structure easily searchable by users in the future.
            </p>

            <p className="text-lg text-gray-700">
              The next page is where you enter publication information,
              including any patents and licensing information if applicable.
              Finally, on the file upload page, you can include any files
              associated with an entry. At a minimum, we highly suggest
              uploading the following files:
            </p>

            <ul className="list-disc space-y-3 pl-6 text-lg text-gray-700">
              <li>
                An original design file (for example, a Cadnano json file)
              </li>
              <li>
                At least one image (idealized, simulated, or experimental) to be
                shown as the entry photo. If you don&apos;t have one available,
                you can use the oxView tool to produce such an image from the
                oxDNA files.
              </li>
              <li>
                If you want the 3D structure viewer to display your structure,
                you&apos;ll also need to convert your design file to oxDNA
                format. Note that providing oxDNA files is not required to
                upload a structure, but it&apos;s recommended. The file
                converted to oxDNA format (using tacoxdna if your design tool
                doesn&apos;t have a built-in exporter) should then be included
                in the list of files you upload.
              </li>
            </ul>

            <p className="text-lg text-gray-700">
              On this page, you can also upload additional image files that will
              appear in a gallery on the entry page, as well as experimental and
              simulation protocols and results that you&apos;d like to share
              with the wider community.
            </p>
          </div>

          <h2 className="mt-12 mb-6 text-4xl font-semibold">
            Private structures
          </h2>

          <div className="space-y-6">
            <p className="text-lg text-gray-700">
              If you don&apos;t want your structure to be publicly available,
              you can make it private by marking the checkbox in the last step
              of the upload process. This will prevent your structure from being
              searchable and appearing on the home page. Once uploaded,
              you&apos;ll be taken to your structure page. You can view your
              private structure using the link or by clicking &quot;View my
              structures&quot; in your Profile page. The structure will only be
              visible to anyone who has a link to it.
            </p>

            <p className="text-lg text-gray-700">
              If you select a private structure, you may choose to make it
              public at a later date (e.g., after being published).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
